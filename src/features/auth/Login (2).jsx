import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors = {};
    if (!email.trim()) errors.email = "Enter your email.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";
    if (!password) errors.password = "Enter your password.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.error?.code;
      if (status === 429 || code === "TOO_MANY_ATTEMPTS") {
        setFormError("Too many attempts. Please wait a few minutes and try again.");
      } else if (code === "ACCOUNT_DEACTIVATED") {
        setFormError("This account has been deactivated. Contact support if you think that's a mistake.");
      } else {
        // INVALID_CREDENTIALS and anything else on this screen: generic
        // message, never confirm which field was wrong.
        setFormError("Invalid email or password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page--centered">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="auth-card__eyebrow">Welcome back</p>
        <h1 style={{ fontSize: "var(--text-2xl)" }}>Log in</h1>

        {formError && (
          <div className="banner banner--error" role="alert">
            {formError}
          </div>
        )}

        <div className={`field ${fieldErrors.email ? "field--error" : ""}`}>
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          />
          {fieldErrors.email && (
            <p className="field-error" id="login-email-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className={`field ${fieldErrors.password ? "field--error" : ""}`}>
          <label htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          />
          {fieldErrors.password && (
            <p className="field-error" id="login-password-error">
              {fieldErrors.password}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner" />}
          {isSubmitting ? "Logging in…" : "Log in"}
        </button>

        <p className="auth-card__footer">
          New to ThoughtShare? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}
