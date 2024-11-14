import { Form } from "react-hook-form";



const onClickSignup = ()=>{

}

export default function SignupPage() {
  return (
    <form>
      <div>
        <div>이메일:</div> <input type="text" />
      </div>
      <div>
        <div>이름:</div> <input type="text" />
      </div>

      <div>
        <div>비밀번호:</div> <input type="text" />
      </div>
      <div>
        {/* 앞에 쓴 비밀번호와 문자가 다르면 에러를 알려주기 */}
        <div>비밀번호확인:</div> <input type="text" />
      </div>

      <button>회원가입</button>
    </form>
  );
}
