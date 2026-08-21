import { SHARED_ASSETS } from "./assets";

/**
 * The login strip at the top of the editor column.
 *
 * The target ships this with `hide` on it and the bundle strips the class after mount,
 * so it is visible in practice. Authentication is out of scope for this clone, so the
 * strip is reproduced visually and does nothing when clicked.
 * Spec: docs/research/order-hereserver-com-a6d29d9e/SharedShell.spec.md#6-editorloginstrip
 */
export function EditorLoginStrip() {
  return (
    <div className="user-container justify-center">
      <div className="avatar">
        {/* eslint-disable-next-line @next/next/no-img-element -- matches the target's plain <img> */}
        <img src={SHARED_ASSETS.loginAvatar} width="40px" height="40px" alt="用户头像" />
      </div>
      <div className="username" />
      <div className="logout ml-1 hide"> | 登出</div>
      <div className="no-username">请登录后使用</div>
    </div>
  );
}
