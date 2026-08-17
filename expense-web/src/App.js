import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://127.0.0.1:8000";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      setExpenses(response.data);
    } catch (error) {
      console.error("Error loading expenses:", error);

      if (error.response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchExpenses();
    }
  }, [token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api-token-auth/`,
        {
          username: username,
          password: password,
        }
      );

      const receivedToken = response.data.token;

      localStorage.setItem("token", receivedToken);
      setToken(receivedToken);
    } catch (error) {
      console.error("Login error:", error);

      setLoginError(
        error.response?.data?.non_field_errors?.[0] ||
        "Invalid username or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setExpenses([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        `${API_URL}/expenses/`,
        {
          amount: amount,
          category: category,
          description: description,
          date: date,
        },
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      setAmount("");
      setCategory("");
      setDescription("");
      setDate("");

      fetchExpenses();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Unable to add expense.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/expenses/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });

      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  /* =========================
     LOGIN PAGE
  ========================= */

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="login-logo">₹</div>

          <h1>ExpenseTrack</h1>

          <p className="login-subtitle">
            Sign in to manage your personal expenses
          </p>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            {loginError && (
              <p className="login-error">{loginError}</p>
            )}

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* =========================
     DASHBOARD
  ========================= */

  return (
    <div className="app">
      <nav className="navbar">
        <div className="brand">
          <div className="brand-icon">₹</div>
          <span>ExpenseTrack</span>
        </div>

        <div className="nav-right">
          <span className="welcome-text">Welcome back!</span>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard">
        <div className="page-heading">
          <p className="eyebrow">PERSONAL FINANCE</p>

          <h1>Expense Dashboard</h1>

          <p className="subtitle">
            Keep track of your spending and stay on top of your finances.
          </p>
        </div>

        <section className="summary-card">
          <div className="summary-content">
            <div>
              <p className="summary-label">TOTAL SPENT</p>

              <h2>₹{total.toFixed(2)}</h2>

              <p className="summary-description">
                Your current expense total
              </p>
            </div>

            <div className="summary-icon">₹</div>
          </div>
        </section>

        <section className="content-grid">
          <div className="card expense-form-card">
            <div className="card-header">
              <div>
                <h2>Add Expense</h2>
                <p>Record a new transaction</p>
              </div>

              <div className="card-icon">＋</div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Amount</label>

                <div className="amount-input">
                  <span>₹</span>

                  <input
                    type="number"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>

                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="food">Food</option>
                  <option value="travel">Travel</option>
                  <option value="shopping">Shopping</option>
                  <option value="entertainment">
                    Entertainment
                  </option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>

                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you spend on?"
                  required
                />
              </div>

              <div className="form-group">
                <label>Date</label>

                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="primary-btn">
                Add Expense
              </button>
            </form>
          </div>

          <div className="card transactions-card">
            <div className="card-header">
              <div>
                <h2>Recent Expenses</h2>
                <p>Your latest transactions</p>
              </div>
            </div>

            <div className="transaction-list">
              {expenses.length === 0 ? (
                <p className="empty-message">
                  No expenses yet.
                </p>
              ) : (
                expenses.map((expense) => (
                  <div className="transaction" key={expense.id}>
                    <div className="transaction-icon">
                      {expense.category
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="transaction-info">
                      <h3>{expense.category}</h3>

                      <p>{expense.description}</p>

                      <span>{expense.date}</span>
                    </div>

                    <strong>
                      − ₹{Number(expense.amount).toFixed(2)}
                    </strong>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(expense.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;