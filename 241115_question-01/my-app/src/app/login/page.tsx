//로그인 페이지

// 각 주석 설명:
// 필요한 도구들 임포트:

// useAccessTokenStore: 로그인한 사람의 액세스 토큰을 저장하고 관리하는 도구.
// gql, useMutation: GraphQL을 사용하여 서버와 데이터를 주고받는 도구.
// useRouter: 페이지를 이동할 수 있게 해주는 도구.
// useForm: 폼 데이터를 쉽게 처리할 수 있게 도와주는 도구.
// z 및 zodResolver: Zod는 강력한 유효성 검사를 제공하고, zodResolver는 react-hook-form과 Zod를 연결해주는 도구.
// GraphQL 쿼리:

// LOGIN_USER: 로그인 요청을 보내는 GraphQL 쿼리로, 이메일과 비밀번호를 서버로 보내고, 서버는 성공하면 accessToken을 반환함.
// Zod 유효성 검사 규칙:

// loginSchema: 이메일과 비밀번호에 대해 유효성 검사를 수행하는 규칙. 이메일 형식이 맞는지, 비밀번호 길이가 최소 6자인지 확인.
// useForm을 사용하여 폼 처리:

// register: 폼 필드를 등록하고, 그 필드에 대한 유효성 검사를 연결하는 함수.
// handleSubmit: 폼 제출 시 실행할 함수.
// formState.errors: 폼 검증 오류를 추적하는 객체.
// onClickLogin 함수:

// 로그인 요청을 보낼 때 사용하는 함수로, 서버로 이메일과 비밀번호를 보내고, 로그인 성공 시 accessToken을 받아 상태에 저장하고 다른 페이지로 이동.
// 폼 렌더링:

// register("email"), register("password"): 각각 이메일과 비밀번호 필드를 react-hook-form에 등록.
// errors.email, errors.password: 유효성 검사에서 오류가 발생하면 해당 오류 메시지를 화면에 출력.

"use client";

// 필요한 도구들을 임포트합니다.
import { useAccessTokenStore } from "@/commons/stores/useAccessTokenStore"; // 로그인 후 액세스 토큰을 저장하는 도구
import { gql, useMutation } from "@apollo/client"; // GraphQL을 사용하여 서버와 통신하는 도구
import { useRouter } from "next/navigation"; // 페이지 이동을 위한 도구
import { useForm } from "react-hook-form"; // 폼 데이터를 처리하는 도구
import { z } from "zod"; // 유효성 검사를 위한 라이브러리
import { zodResolver } from "@hookform/resolvers/zod"; // react-hook-form과 Zod를 연결하는 도구

// 로그인 요청을 보내기 위한 GraphQL 쿼리
const LOGIN_USER = gql`
  mutation loginUser($password: String!, $email: String!) {
    loginUser(password: $password, email: $email) {
      accessToken
      # // 로그인 성공 시 accessToken을 반환
    }
  }
`;

// Zod를 사용하여 로그인 폼 데이터에 대한 유효성 검사 규칙 정의
const loginSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요."), // 이메일 형식이 맞는지 확인
  password: z.string().min(4, "비밀번호는 최소 4자리 이상이어야 합니다."), // 비밀번호는 6자리 이상이어야 함
});

export default function LoginPage() {
  // 로그인 요청을 보내는 함수 생성
  const [loginUser] = useMutation(LOGIN_USER);

  // 로그인 성공 후, 토큰을 저장할 상태 관리 함수
  const { setAccessToken } = useAccessTokenStore();

  // 페이지 이동을 위한 useRouter 훅
  const router = useRouter();

  // react-hook-form의 useForm 훅을 사용하여 폼 처리
  // zodResolver로 Zod 유효성 검사 규칙을 적용
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema), // Zod를 통해 폼 데이터를 검증
  });

  // 로그인 함수
  const onClickLogin = async (data) => {
    console.log("로그인 데이터:", data); // 콘솔에 폼 데이터를 출력 (디버깅용)

    try {
      // 서버에 로그인 요청 보내기
      const result = await loginUser({
        variables: {
          password: data.password, // 폼에서 입력받은 비밀번호
          email: data.email, // 폼에서 입력받은 이메일
        },
      });

      console.log("로그인 결과:", result); // 로그인 결과를 콘솔에 출력

      // 서버에서 받은 액세스 토큰
      const accessToken = result.data.loginUser.accessToken;

      // 액세스 토큰이 없다면 로그인 실패로 처리
      if (!accessToken) {
        alert("로그인 실패. 다시 시도해주세요.");
        return;
      }

      // 로그인 성공 시, 받은 accessToken을 상태에 저장
      setAccessToken(accessToken);

      // 로그인 성공 후, 게시판 페이지로 이동
      router.push("/boards");
    } catch (error) {
      // 로그인 중 에러가 발생한 경우
      console.error("로그인 오류:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  // 렌더링되는 JSX 코드
  return (
    <form onSubmit={handleSubmit(onClickLogin)}>
      {" "}
      {/* 폼 제출 시 onClickLogin 함수 실행 */}
      <div>
        <label htmlFor="email">Email:</label> {/* 이메일 입력 필드 레이블 */}
        <input
          id="email"
          type="text"
          {...register("email")}
          // {/* email 필드에 대한 유효성 검사와 등록 */}
        />
        {/* 이메일에 오류가 있으면 오류 메시지 출력 */}
        {errors.email && <span>{errors.email.message}</span>}
      </div>
      <div>
        <label htmlFor="password">Password:</label>
        {/* 비밀번호 입력 필드 레이블 */}
        <input
          id="password"
          type="password"
          {...register("password")}
          // {/* password 필드에 대한 유효성 검사와 등록 */}
        />
        {/* 비밀번호에 오류가 있으면 오류 메시지 출력 */}
        {errors.password && <span>{errors.password.message}</span>}
      </div>
      <button type="submit">로그인</button> {/* 로그인 버튼 */}
    </form>
  );
}
