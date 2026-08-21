import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate() {
    const errors = {};
    const trimmedName = name.trim();
    if (!trimmedName) errors.name = "Enter your name.";
    else if (trimmedName.length < 2 || trimmedName.length > 100) {
      errors.name = "Name must be between 2 and 100 characters.";
    }

    if (!email.trim()) errors.email = "Enter your email.";
    else if (!EMAIL_RE.test(email)) errors.email = "Enter a valid email address.";

    if (!password) errors.password = "Create a password.";
    else if (!PASSWORD_RE.test(password)) {
      errors.password = "Must be at least 8 characters with an uppercase letter and a number.";
    }

    if (confirmPassword !== password) errors.confirmPassword = "Passwords don't match.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(name.trim(), email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const status = err?.response?.status;
      const code = err?.response?.data?.error?.code;
      const apiField = err?.response?.data?.error?.field;
      if (code === "EMAIL_TAKEN") {
        setFieldErrors((prev) => ({ ...prev, email: "An account with this email already exists." }));
      } else if (status === 400 && apiField) {
        setFieldErrors((prev) => ({ ...prev, [apiField]: err.response.data.error.message }));
      } else {
        setFormError("Couldn't create your account. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page--centered">
      <form className="auth-card" onSubmit={handleSubmit} noValidate>
        <p className="auth-card__eyebrow">Join ThoughtShare</p>
        <h1 style={{ fontSize: "var(--text-2xl)" }}>Create your account</h1>

        {formError && (
          <div className="banner banner--error" role="alert">
            {formError}
          </div>
        )}

        <div className={`field ${fieldErrors.name ? "field--error" : ""}`}>
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-invalid={!!fieldErrors.name}
            aria-describedby={fieldErrors.name ? "register-name-error" : undefined}
          />
          {fieldErrors.name && (
            <p className="field-error" id="register-name-error">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className={`field ${fieldErrors.email ? "field--error" : ""}`}>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby={fieldErrors.email ? "register-email-error" : undefined}
          />
          {fieldErrors.email && (
            <p className="field-error" id="register-email-error">
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className={`field ${fieldErrors.password ? "field--error" : ""}`}>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            aria-describedby={fieldErrors.password ? "register-password-error" : "register-password-hint"}
          />
          {fieldErrors.password ? (
            <p className="field-error" id="register-password-error">
              {fieldErrors.password}
            </p>
          ) : (
            <p className="field-hint" id="register-password-hint">
              At least 8 characters, with an uppercase letter and a number.
            </p>
          )}
        </div>

        <div className={`field ${fieldErrors.confirmPassword ? "field--error" : ""}`}>
          <label htmlFor="register-confirm">Confirm password</label>
          <input
            id="register-confirm"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={fieldErrors.confirmPassword ? "register-confirm-error" : undefined}
          />
          {fieldErrors.confirmPassword && (
            <p className="field-error" id="register-confirm-error">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>

        <button type="submit" className="btn btn--primary btn--block" disabled={isSubmitting}>
          {isSubmitting && <span className="spinner" />}
          {isSubmitting ? "Creating account…" : "Create account"}
        </button>

        <p className="auth-card__footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </form>
    </div>
  );
}
