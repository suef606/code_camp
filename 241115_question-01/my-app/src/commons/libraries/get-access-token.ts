import { gql, GraphQLClient } from "graphql-request";

const RESTORE_ACCESS_TOKEN = gql`
  mutation restoreAccessToken {
    restoreAccessToken {
      accessToken
    }
  }
`;

export const getAccessToken = async () => {
  console.log("아무말이나 왜 안들어오니 ::::::::::::");
  try {
    const graphqlClient = new GraphQLClient("https://main-practice.codebootcamp.co.kr/graphql", 
      { credentials: "include" });

    const result = await graphqlClient.request(RESTORE_ACCESS_TOKEN);
    const newAccessToken = result.restoreAccessToken.accessToken;
    console.log("새 accessToken:", newAccessToken); // 새로 발급된 토큰 확인
    return newAccessToken;
  } catch (error) {
    console.error("Access Token 요청 중 에러 발생:", error); // 에러 로그
  }
};