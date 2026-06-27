import { CheckCircle2, X } from "lucide-react";
import { FormEvent, useState } from "react";

type AuthFormModalProps = {
  open: boolean;
  onClose: () => void;
};

const registeredAccounts = [
  { name: "企业体验账号", phone: "13800004301", code: "4301" },
  { name: "读者体验账号", phone: "13900004302", code: "4302" },
];

export function AuthFormModal({ open, onClose }: AuthFormModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sentCode, setSentCode] = useState("");
  const [message, setMessage] = useState("");

  if (!open) return null;

  function sendCode() {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setMessage("请输入 11 位中国大陆手机号");
      return;
    }
    const matched = registeredAccounts.find((account) => account.phone === phone);
    const nextCode = matched?.code ?? "4321";
    setSentCode(nextCode);
    setCode("");
    setMessage("验证码已发送，请手动填写");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setMessage("请输入 11 位中国大陆手机号");
      return;
    }
    if (mode === "login" && !registeredAccounts.some((account) => account.phone === phone)) {
      setMessage("该手机号尚未注册，请切换到注册");
      return;
    }
    if (!sentCode) {
      setMessage("请先获取验证码");
      return;
    }
    if (code !== sentCode) {
      setMessage("验证码不正确，请重新获取");
      return;
    }
    setMessage(mode === "login" ? "登录成功" : "注册成功");
    window.setTimeout(onClose, 450);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="auth-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>
        <div className="auth-tabs" role="tablist" aria-label="认证模式">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            登录
          </button>
          <button
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            注册
          </button>
        </div>
        <h2 id="auth-title">{mode === "login" ? "手机号验证码登录" : "手机号验证码注册"}</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            手机号
            <input
              type="tel"
              name="phone"
              value={phone}
              inputMode="numeric"
              placeholder="请输入 11 位手机号"
              onChange={(event) => setPhone(event.target.value)}
              required
            />
          </label>
          <label>
            验证码
            <div className="code-row">
              <input
                type="text"
                name="code"
                value={code}
                inputMode="numeric"
                placeholder="4 位验证码"
                maxLength={4}
                onChange={(event) => setCode(event.target.value)}
                required
              />
              <button type="button" className="secondary-button" onClick={sendCode}>
                获取验证码
              </button>
            </div>
          </label>
          {message && (
            <p className="auth-message">
              <CheckCircle2 size={15} />
              {message}
            </p>
          )}
          <button className="primary-button full" type="submit">
            {mode === "login" ? "登录" : "注册并登录"}
          </button>
        </form>
      </section>
    </div>
  );
}
