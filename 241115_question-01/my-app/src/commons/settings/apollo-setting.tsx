"use client";

import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  fromPromise,
  InMemoryCache,
} from "@apollo/client";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { useAccessTokenStore } from "../stores/useAccessTokenStore";
import { getAccessToken } from "@/commons/libraries/get-access-token";
import { useEffect } from "react";
import { useLoadStore } from "../stores/load-store";
import { onError } from "@apollo/client/link/error";

const GLOBAL_STATE = new InMemoryCache(); //GraphQL 쿼리 결과를 메모리 안에 저장

interface IApolloSetting {
  children: React.ReactNode;
}
export default function ApolloSetting(props: IApolloSetting) {
  const { accessToken, setAccessToken } = useAccessTokenStore(); //로그인하면서 zustand에 저장된 accessToken을 쓴다
  const { setIsLoaded } = useLoadStore(); // 새로고침에도 토큰 유지 되게하기 위해

  // 로그인을 하면 서버에서 먼저 pre-rendering을 하기 때문에 localStorage에 저장하면(브라우저)에러가 발생
  // 새로고침해도 토큰 유지
  useEffect(() => {
    getAccessToken()
      .then((newAccessToken) => {
        if (newAccessToken) setAccessToken(newAccessToken);
      })
      .finally(setIsLoaded);
  }, []);

  // refreshToken을 이용한 accessToken 재발급 순서
  const errorLink = onError(({ graphQLErrors, operation, forward }) => {
    // 1. 인가 요청(accessToken이 만료 됐으니까 error 발생)
    if (typeof graphQLErrors !== "undefined") {
      for (const err of graphQLErrors) {
        // 2. 위의 error가 인가 에러인지 확인
        if (err.extensions?.code === "UNAUTHENTICATED") {
          return fromPromise(
            // 3. 로그인하면서 받은 refreshToken으로 accessToken 재발급 요청
            //     -> graphql-request 설치하기
            //     -> graphql 요청해야하는데 errorLink를 생성하는 코드는 ApolloProvider 밖에 있어서 따로 getAccessToken파일 분리
            getAccessToken().then((newAccessToken) => {
              // 4. new accessToken을 zustand의 state에 저장
              setAccessToken(newAccessToken ?? "");

              // 방금전 실패햇던 쿼리가 뭔지 확인
              operation.setContext({
                headers: {
                  ...operation.getContext().headers, //// Authorization: Bearer qklqkjdkjafsklj => 만료된 토큰이 추가되어 있는 상태
                },
              });
            })
            // 5. 다시 인가 요청
          ).flatMap(() => forward(operation)); //실패했던 쿼리 재전송
        }
      }
    }
  });

  const uploadLink = createUploadLink({
    uri: "https://main-practice.codebootcamp.co.kr/graphql", // refreshToken으로 요청 보낼때는 민감하니까 https !!
    headers: { Authorization: `Bearer ${accessToken}` }, //모든 컴포넌트에서 accessToken을 같이 로그인하면서 보내준다
    credentials: "include", // refreshToken을 보낼때 민감한 정보가 들어가므로 승인해주기 -> 쿠키에 refreshToken을 담고 이걸 백엔드로 보내는 역할
  });

  const client = new ApolloClient({
    link: ApolloLink.from([errorLink, uploadLink]),
    cache: GLOBAL_STATE, //캐싱전략 설정
  });

  return <ApolloProvider client={client}>{props.children}</ApolloProvider>;
}
