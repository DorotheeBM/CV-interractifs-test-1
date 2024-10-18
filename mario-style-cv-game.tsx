import React, { useState, useEffect, useCallback } from 'react';

const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;
const GROUND_HEIGHT = 40;
const PLAYER_WIDTH = 40;
const PLAYER_HEIGHT = 60;
const GRAVITY = 0.6;
const JUMP_STRENGTH = 12;

const CVGame = () => {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT });
  const [playerVelocity, setPlayerVelocity] = useState({ x: 0, y: 0 });
  const [isJumping, setIsJumping] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [cvItems, setCvItems] = useState([]);
  const [collectedItems, setCollectedItems] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', description: '' });

  const cvData = [
    { title: "Infos Personnelles", description: "Dorothée Braud-Meignant, Franco-Américaine, née en 1983" },
    { title: "Expérience", description: "Cheffe de projets ventes internationales chez MEDIAWAN (2017-2022)" },
    { title: "Formation", description: "Master en Marketing et Distribution Audiovisuelle, INA SUP - Sorbonne" },
    { title: "Compétences", description: "Gestion de projet, Traduction, Web, Marketing" },
    { title: "Langues", description: "Français (natif), Anglais (bilingue), Allemand (professionnel)" }
  ];

  useEffect(() => {
    const newPlatforms = cvData.map((_, index) => ({
      x: 200 + index * 300,
      y: GAME_HEIGHT - GROUND_HEIGHT - 100 - Math.random() * 100,
      width: 100,
      height: 20
    }));
    setPlatforms(newPlatforms);

    const newCvItems = cvData.map((item, index) => ({
      ...item,
      x: 230 + index * 300,
      y: newPlatforms[index].y - 40,
      collected: false
    }));
    setCvItems(newCvItems);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowLeft') {
      setPlayerVelocity(v => ({ ...v, x: -5 }));
    } else if (e.key === 'ArrowRight') {
      setPlayerVelocity(v => ({ ...v, x: 5 }));
    } else if (e.key === 'ArrowUp' && !isJumping) {
      setPlayerVelocity(v => ({ ...v, y: -JUMP_STRENGTH }));
      setIsJumping(true);
    }
  }, [isJumping]);

  const handleKeyUp = useCallback((e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      setPlayerVelocity(v => ({ ...v, x: 0 }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setPlayerPos(pos => {
        let newX = pos.x + playerVelocity.x;
        let newY = pos.y + playerVelocity.y;

        setPlayerVelocity(v => ({ ...v, y: v.y + GRAVITY }));

        if (newY > GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT) {
          newY = GAME_HEIGHT - GROUND_HEIGHT - PLAYER_HEIGHT;
          setPlayerVelocity(v => ({ ...v, y: 0 }));
          setIsJumping(false);
        }

        platforms.forEach(platform => {
          if (
            newX < platform.x + platform.width &&
            newX + PLAYER_WIDTH > platform.x &&
            newY + PLAYER_HEIGHT > platform.y &&
            newY < platform.y + platform.height
          ) {
            if (pos.y + PLAYER_HEIGHT <= platform.y) {
              newY = platform.y - PLAYER_HEIGHT;
              setPlayerVelocity(v => ({ ...v, y: 0 }));
              setIsJumping(false);
            }
          }
        });

        cvItems.forEach((item, index) => {
          if (
            !item.collected &&
            newX < item.x + 30 &&
            newX + PLAYER_WIDTH > item.x &&
            newY < item.y + 30 &&
            newY + PLAYER_HEIGHT > item.y
          ) {
            setCvItems(items => items.map((i, idx) => idx === index ? { ...i, collected: true } : i));
            setCollectedItems(collected => [...collected, item]);
            setDialogContent({ title: item.title, description: item.description });
            setShowDialog(true);
          }
        });

        newX = Math.max(0, Math.min(newX, GAME_WIDTH - PLAYER_WIDTH));

        return { x: newX, y: newY };
      });
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [playerVelocity, platforms, cvItems]);

  return (
    <div style={{ 
      width: GAME_WIDTH, 
      height: GAME_HEIGHT, 
      backgroundColor: '#87CEEB', 
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: GROUND_HEIGHT,
        backgroundColor: '#8B4513'
      }} />

      {platforms.map((platform, index) => (
        <div key={index} style={{
          position: 'absolute',
          left: platform.x,
          top: platform.y,
          width: platform.width,
          height: platform.height,
          backgroundColor: '#C4A484'
        }} />
      ))}

      {cvItems.map((item, index) => (
        !item.collected && (
          <div key={index} style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            width: 30,
            height: 30,
            backgroundColor: 'gold',
            borderRadius: '50%'
          }} />
        )
      ))}

      <div style={{
        position: 'absolute',
        left: playerPos.x,
        top: playerPos.y,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT,
        backgroundColor: 'red',
      }} />

      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        fontSize: '20px'
      }}>
        Score: {collectedItems.length}/{cvItems.length}
      </div>

      {showDialog && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
          zIndex: 10
        }}>
          <h2>{dialogContent.title}</h2>
          <p>{dialogContent.description}</p>
          <button onClick={() => setShowDialog(false)}>OK</button>
        </div>
      )}
    </div>
  );
};

export default CVGame;
