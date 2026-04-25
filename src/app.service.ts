import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Mily API | Gateway</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary: hsl(210, 100%, 50%);
                  --bg: hsl(220, 20%, 10%);
                  --card-bg: hsla(220, 20%, 15%, 0.7);
                  --text: #ffffff;
              }

              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                  font-family: 'Outfit', sans-serif;
              }

              body {
                  background-color: var(--bg);
                  color: var(--text);
                  height: 100vh;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  overflow: hidden;
              }

              /* Animated Background */
              .background {
                  position: absolute;
                  top: 0;
                  left: 0;
                  width: 100%;
                  height: 100%;
                  z-index: -1;
                  background: radial-gradient(circle at 50% 50%, hsl(210, 100%, 20%), transparent 50%),
                              radial-gradient(circle at 10% 10%, hsl(280, 100%, 15%), transparent 30%),
                              radial-gradient(circle at 90% 90%, hsl(200, 100%, 15%), transparent 40%);
                  filter: blur(80px);
                  animation: pulse 15s ease-in-out infinite alternate;
              }

              @keyframes pulse {
                  0% { transform: scale(1); }
                  100% { transform: scale(1.1); }
              }

              .container {
                  background: var(--card-bg);
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                  border: 1px solid rgba(255, 255, 255, 0.1);
                  padding: 3rem;
                  border-radius: 24px;
                  text-align: center;
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                  max-width: 500px;
                  width: 90%;
                  transform: translateY(0);
                  transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  animation: slideUp 0.8s ease-out;
              }

              @keyframes slideUp {
                  from { opacity: 0; transform: translateY(40px); }
                  to { opacity: 1; transform: translateY(0); }
              }

              .container:hover {
                  transform: translateY(-5px);
                  border-color: rgba(255, 255, 255, 0.2);
                  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.6);
              }

              .logo {
                  width: 80px;
                  height: 80px;
                  background: linear-gradient(135deg, var(--primary), #8e2de2);
                  margin: 0 auto 1.5rem;
                  border-radius: 20px;
                  display: flex;
                  justify-content: center;
                  align-items: center;
                  font-size: 2rem;
                  font-weight: 700;
                  box-shadow: 0 10px 20px rgba(0, 120, 255, 0.3);
              }

              h1 {
                  font-size: 2.25rem;
                  margin-bottom: 0.5rem;
                  font-weight: 600;
                  background: linear-gradient(to right, #fff, #a5a5a5);
                  -webkit-background-clip: text;
                  -webkit-text-fill-color: transparent;
              }

              p {
                  color: rgba(255, 255, 255, 0.6);
                  margin-bottom: 2rem;
                  font-weight: 300;
                  line-height: 1.6;
              }

              .status-badge {
                  display: inline-flex;
                  align-items: center;
                  padding: 0.5rem 1rem;
                  background: rgba(34, 197, 94, 0.1);
                  color: #22c55e;
                  border-radius: 100px;
                  font-size: 0.875rem;
                  font-weight: 600;
                  margin-bottom: 2rem;
              }

              .status-dot {
                  width: 8px;
                  height: 8px;
                  background: #22c55e;
                  border-radius: 50%;
                  margin-right: 8px;
                  box-shadow: 0 0 10px #22c55e;
                  animation: blink 2s infinite;
              }

              @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.4; }
              }

              .actions {
                  display: grid;
                  grid-template-columns: 1fr;
                  gap: 1rem;
              }

              .btn {
                  padding: 0.75rem 1rem;
                  border-radius: 12px;
                  text-decoration: none;
                  font-size: 0.9375rem;
                  font-weight: 600;
                  transition: all 0.2s;
              }

              .btn-primary {
                  background: var(--primary);
                  color: white;
              }

              .btn-primary:hover {
                  background: hsl(210, 100%, 60%);
                  transform: scale(1.02);
              }

              .btn-secondary {
                  background: rgba(255, 255, 255, 0.05);
                  color: white;
                  border: 1px solid rgba(255, 255, 255, 0.1);
              }

              .btn-secondary:hover {
                  background: rgba(255, 255, 255, 0.1);
              }

              .footer {
                  margin-top: 2.5rem;
                  font-size: 0.75rem;
                  color: rgba(255, 255, 255, 0.3);
              }
          </style>
      </head>
      <body>
          <div class="background"></div>
          <div class="container">
              <div class="logo">M</div>
              <h1>Mily API</h1>
              <p>Welcome to the core service layer of the Mily platform. Your gateway to commerce intelligence and backend excellence.</p>
              
              <div class="actions">
                  <a href="https://github.com/DmitriiFRS" class="btn btn-secondary">Developer</a>
              </div>

              <div class="footer">
                  v1.0.0 &bull; Built with NestJS &bull; &copy; 2026 Mily
              </div>
          </div>
      </body>
      </html>
    `;
  }
}
