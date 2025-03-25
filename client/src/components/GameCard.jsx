import React from "react";
import { motion } from "framer-motion";

const GameCard = ({ card, index, isFlipped, isMatched, handleCardClick, styles, currentPlayer }) => {
  // Card styling with 3D flip effect
  const cardInnerStyles = {
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1)",
    transform: isFlipped || isMatched ? "rotateY(180deg)" : "",
  };
  
  // Common styles for both card faces
  const cardFaceStyles = {
    position: "absolute",
    width: "100%",
    height: "100%",
    backfaceVisibility: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
  };
  
  return (
    <motion.div
      style={styles.card}
      initial={{ scale: 0, rotateY: 0 }}
      animate={{
        scale: 1,
        rotateY: 0,
        transition: { delay: index * 0.01, duration: 0.2 },
      }}
      whileHover={{ scale: isFlipped || isMatched ? 1 : 1.03 }}
      whileTap={{ scale: isFlipped || isMatched ? 1 : 0.97 }}
      onClick={handleCardClick}
      className={isMatched ? "opacity-90" : ""}
    >
      <div style={cardInnerStyles}>
        {/* Card Front (Hidden side) */}
        <div
          style={{
            ...cardFaceStyles,
            background: "linear-gradient(135deg, #ff9800, #e65100)",
            border: "2px solid #e65100",
          }}
        >
          <div
            className="rounded-full bg-orange-600 flex items-center justify-center font-bold text-white shadow-inner"
            style={{
              width: "50%",
              height: "50%",
              fontSize: styles.fontSize.title,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
            }}
          >
            DB
          </div>
        </div>
        
        {/* Card Back (Character) */}
        <div
          style={{
            ...cardFaceStyles,
            backgroundColor: "#f5f5f5",
            transform: "rotateY(180deg)",
            border: "2px solid #e0e0e0",
            overflow: "hidden",
          }}
        >
          {/* Image with darkened overlay for matched cards */}
          <div className="relative w-full h-full">
            <img
              src={card.image}
              alt={card.name}
              className={`w-full h-full object-cover ${isMatched ? "brightness-75" : ""}`}
            />
            
            {/* Card name at the bottom */}
            <div
              className="absolute bottom-0 w-full bg-gradient-to-t from-black to-transparent text-white text-center py-1 px-1"
              style={{ fontSize: styles.fontSize.name }}
            >
              {card.name}
            </div>
            
            {/* Matched indicator with player name */}
            {isMatched && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="bg-black bg-opacity-30 text-white rounded-full p-1 shadow-lg mb-2">
               
                </div>
                <div 
                  className="bg-orange-500 bg-opacity-70 text-white px-2 py-1 rounded-md shadow-lg text-center"
                  style={{ fontSize: styles.fontSize.name }}
                >
                 {card.matchedBy || "Player"}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;