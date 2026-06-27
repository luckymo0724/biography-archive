import { CheckCircle2, ScanLine, X } from "lucide-react";
import { CSSProperties } from "react";

type PaymentModalProps = {
  open: boolean;
  title: string;
  price: number;
  onClose: () => void;
  onConfirm: () => void;
};

const qrWrapperStyle: CSSProperties = {
  position: "relative",
  width: "min(245px, 74vw)",
  aspectRatio: "1",
  margin: "16px auto 12px",
  padding: 16,
  display: "grid",
  gridTemplateColumns: "repeat(7, 1fr)",
  gap: 5,
  border: "10px solid white",
  borderRadius: 10,
  background:
    "linear-gradient(90deg, transparent 48%, rgba(36, 79, 70, 0.18) 49% 52%, transparent 53%), linear-gradient(0deg, transparent 48%, rgba(36, 79, 70, 0.14) 49% 52%, transparent 53%), #f8f2e7",
  boxShadow: "0 16px 34px rgba(31, 43, 40, 0.16)",
  overflow: "hidden",
};

const qrLogoStyle: CSSProperties = {
  position: "absolute",
  zIndex: 2,
  inset: "50% auto auto 50%",
  width: 54,
  height: 54,
  transform: "translate(-50%, -50%)",
  display: "grid",
  placeItems: "center",
  border: "5px solid #fffdf8",
  borderRadius: 12,
  background: "#244f46",
  color: "white",
  fontSize: 22,
  fontWeight: 950,
  letterSpacing: 0,
};

export function PaymentModal({ open, title, price, onClose, onConfirm }: PaymentModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="auth-modal payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="icon-button modal-close" onClick={onClose} aria-label="关闭">
          <X size={18} />
        </button>
        <p className="eyebrow">付费阅读</p>
        <h2 id="payment-title">{title}</h2>
        <p>扫码后点击下方按钮完成演示解锁。二维码为模拟样式，后续可接入真实微信或支付宝收款。</p>
        <div className="price-box">
          <span>¥{price}</span>
          <small>单篇阅读</small>
        </div>
        <div className="fake-qr" aria-label="模拟支付二维码" style={qrWrapperStyle}>
          {Array.from({ length: 49 }).map((_, index) => (
            <i
              key={index}
              style={{
                display: "block",
                borderRadius: 2,
                background: "rgba(23, 33, 31, 0.86)",
                opacity:
                  index % 3 === 0 ||
                  index % 4 === 1 ||
                  [0, 1, 2, 7, 9, 14, 15, 16, 28, 29, 30, 35, 37, 42, 43, 44].includes(index)
                    ? 0.92
                    : 0.18,
                filter: "blur(0.55px)",
              }}
            />
          ))}
          <strong style={qrLogoStyle}>43</strong>
        </div>
        <div
          className="qr-caption"
          style={{
            margin: "0 0 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
            color: "#66716d",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          <ScanLine size={16} />
          模拟扫码支付
        </div>
        <button className="primary-button full" onClick={onConfirm}>
          <CheckCircle2 size={18} />
          模拟支付并解锁
        </button>
      </section>
    </div>
  );
}
