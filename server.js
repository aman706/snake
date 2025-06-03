/* Reset and basics */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  user-select: none;
}

body {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  min-height: 100vh;
  padding: 1rem;
  overflow: hidden;
  transition: background 0.5s ease, color 0.5s ease;
  background: linear-gradient(-45deg, #f9f8f7, #a8edea, #f9f8f7, #a8edea);
  background-size: 400% 400%;
  animation: bgLight 15s ease infinite;
  color: #333;
}

body.dark {
  background: linear-gradient(-45deg, #0f2027, #203a43, #2c5364, #0f2027);
  animation: bgDark 20s ease infinite;
  color: #ddd;
}

@keyframes bgLight {
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
}

@keyframes bgDark {
  0% {background-position: 0% 50%;}
  50% {background-position: 100% 50%;}
  100% {background-position: 0% 50%;}
}

h1 {
  margin-bottom: 1rem;
  text-shadow: 1px 1px 3px rgba(255, 255, 255, 0.7);
  user-select: none;
}

body.dark h1 {
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

#gameCanvas {
  background: linear-gradient(45deg, #004e92, #000428);
  border: 5px solid #61dafb;
  border-radius: 20px;
  box-shadow: 0 0 20px #61dafbaa;
  outline: none;
  touch-action: none;
  max-width: 100vw;
  height: auto;
  aspect-ratio: 3 / 2;
  transition: background 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
}

body.dark #gameCanvas {
  background: linear-gradient(45deg, #121a24, #1c2833);
  border-color: #bb86fc;
  box-shadow: 0 0 20px #bb86fcaa;
}

.info {
  margin-top: 1rem;
  font-size: 1.2rem;
  display: flex;
  gap: 1rem;
  align-items: center;
}

button {
  background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  cursor: pointer;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 4px 8px #fda085bb;
  transition: background 0.3s ease;
  user-select: none;
}

button:hover {
  background: linear-gradient(135deg, #fda085 0%, #f6d365 100%);
}

body.dark button {
  background: linear-gradient(135deg, #7e57c2 0%, #9575cd 100%);
  box-shadow: 0 4px 8px #9575cdbb;
  color: #ddd;
}

body.dark button:hover {
  background: linear-gradient(135deg, #9575cd 0%, #7e57c2 100%);
}

footer {
  margin-top: 2rem;
  font-style: italic;
  font-size: 0.9rem;
  user-select: none;
  color: inherit;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}
