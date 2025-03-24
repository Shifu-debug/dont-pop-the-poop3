import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const getRandomX = () => Math.floor(Math.random() * (window.innerWidth - 50));

export default function GameMockup() {
  const [isFlying, setIsFlying] = useState(false);
  const [poopPressure, setPoopPressure] = useState(0);
  const [birdY, setBirdY] = useState(200);
  const [gameOver, setGameOver] = useState(false);
  const [pedestrians, setPedestrians] = useState([{ x: getRandomX(), id: Date.now() }]);
  const [birdX] = useState(window.innerWidth / 2);
  const [poopDrops, setPoopDrops] = useState([]);
  const [score, setScore] = useState(0);
  const [skin, setSkin] = useState("🐦");

  useEffect(() => {
    if (gameOver) return;
    const gravity = 2;
    const lift = -5;
    const interval = setInterval(() => {
      setBirdY((prevY) => Math.max(0, Math.min(prevY + (isFlying ? lift : gravity), 400)));
      setPoopPressure((prev) => {
        const newPressure = prev + 1;
        if (newPressure >= 100) setGameOver(true);
        return newPressure;
      });
      setScore((prev) => prev + 1);
    }, 100);
    return () => clearInterval(interval);
  }, [isFlying, gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const movePedestrians = setInterval(() => {
      setPedestrians((prev) =>
        prev.map((p) => ({ ...p, x: p.x - 2 })).filter((p) => p.x > -50)
      );
      if (Math.random() < 0.05) {
        setPedestrians((prev) => [...prev, { x: window.innerWidth, id: Date.now() }]);
      }
    }, 100);
    return () => clearInterval(movePedestrians);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const dropInterval = setInterval(() => {
      setPoopDrops((prev) => {
        const updated = prev.map((p) => ({ ...p, y: p.y + 10 }));
        for (let drop of updated) {
          for (let ped of pedestrians) {
            if (drop.y > 420 && drop.x > ped.x && drop.x < ped.x + 40) {
              setGameOver(true);
              return [];
            }
          }
        }
        return updated.filter((p) => p.y < 500);
      });
    }, 100);
    return () => clearInterval(dropInterval);
  }, [pedestrians, gameOver]);

  const handleFly = () => {
    if (!gameOver) setIsFlying(true);
  };

  const handleStopFly = () => {
    setIsFlying(false);
  };

  const handlePoop = () => {
    if (!gameOver && poopPressure > 10) {
      setPoopDrops((prev) => [...prev, { x: birdX, y: birdY + 20 }]);
      setPoopPressure(0);
    }
  };

  const resetGame = () => {
    setIsFlying(false);
    setPoopPressure(0);
    setBirdY(200);
    setGameOver(false);
    setPedestrians([{ x: getRandomX(), id: Date.now() }]);
    setPoopDrops([]);
    setScore(0);
  };

  const skins = ["🐦", "🦅", "🐧", "🐤", "🐲"];

  return (
    <div className="w-screen h-screen bg-sky-300 overflow-hidden relative"
         onMouseDown={handleFly}
         onMouseUp={handleStopFly}
         onTouchStart={handleFly}
         onTouchEnd={handleStopFly}>
      <div className="absolute top-4 left-4 text-xl font-bold">
        💩 Pressure: {poopPressure}% | 🏆 Score: {score}
      </div>
      {gameOver && (
        <div className="absolute text-center w-full top-1/2 transform -translate-y-1/2">
          <div className="text-4xl font-bold text-red-600">
            {poopPressure >= 100 ? "POOP EXPLOSION 💥" : "YOU POOPED ON SOMEONE 💩"}
          </div>
          <div className="mt-4 text-2xl font-semibold">Score: {score}</div>
          <button onClick={resetGame}
                  className="mt-4 px-6 py-3 bg-white rounded-full text-lg font-semibold shadow-md hover:bg-yellow-100">
            Play Again
          </button>
        </div>
      )}
      <motion.div className="w-16 h-16 bg-yellow-300 rounded-full shadow-lg border-2 border-black flex items-center justify-center text-2xl"
                  animate={{ y: birdY }}
                  transition={{ type: "spring", stiffness: 200 }}
                  style={{ position: "absolute", left: birdX - 32 }}>
        {skin}
      </motion.div>
      {pedestrians.map((p) => (
        <div key={p.id}
             className="w-10 h-16 bg-green-600 rounded-md absolute bottom-0"
             style={{ left: p.x }} />
      ))}
      {poopDrops.map((drop, index) => (
        <motion.div key={index}
                    className="absolute text-xl"
                    animate={{ y: drop.y }}
                    transition={{ duration: 0.1 }}
                    style={{ left: drop.x }}>
          💩
        </motion.div>
      ))}
      <button onClick={handlePoop}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-white rounded-full text-lg font-semibold shadow-md hover:bg-yellow-100">
        Drop the Poop
      </button>
      <div className="absolute top-4 right-4">
        <label className="text-sm mr-2 font-semibold">Bird Skin:</label>
        <select value={skin}
                onChange={(e) => setSkin(e.target.value)}
                className="px-2 py-1 rounded">
          {skins.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
