import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f8fafc;
    color: #1e293b;
    line-height: 1.6;
  }

  html {
    scroll-behavior: smooth;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  input, textarea, select {
    font-family: inherit;
    outline: none;
  }

  img {
    max-width: 100%;
    height: auto;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }

  /* Utility classes */
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    transition: all 0.2s ease;
    border: none;
    cursor: pointer;
    text-decoration: none;
  }

  .btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }

  .btn-secondary {
    background: #f1f5f9;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .btn-secondary:hover {
    background: #e2e8f0;
    transform: translateY(-1px);
  }

  .btn-danger {
    background: #ef4444;
    color: white;
  }

  .btn-danger:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }

  .card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    padding: 24px;
    transition: all 0.2s ease;
  }

  .card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #374151;
  }

  .form-input {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.2s ease;
  }

  .form-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-input.error {
    border-color: #ef4444;
  }

  .error-message {
    color: #ef4444;
    font-size: 14px;
    margin-top: 4px;
  }

  .success-message {
    color: #10b981;
    font-size: 14px;
    margin-top: 4px;
  }

  /* Responsive breakpoints */
  @media (max-width: 768px) {
    .container {
      padding: 0 16px;
    }
    
    .card {
      padding: 16px;
    }
    
    .btn {
      padding: 10px 20px;
      font-size: 14px;
    }
  }

  @media (max-width: 480px) {
    .container {
      padding: 0 12px;
    }
    
    .card {
      padding: 12px;
    }
    
    .btn {
      padding: 8px 16px;
      font-size: 13px;
    }
  }

  /* Loading spinner */
  .spinner {
    border: 3px solid #f3f4f6;
    border-top: 3px solid #667eea;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Grid system */
  .grid {
    display: grid;
    gap: 24px;
  }

  .grid-2 {
    grid-template-columns: repeat(2, 1fr);
  }

  .grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }

  .grid-4 {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1024px) {
    .grid-4 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 768px) {
    .grid-3, .grid-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .grid-2, .grid-3, .grid-4 {
      grid-template-columns: 1fr;
    }
  }
`;

export default GlobalStyles; 