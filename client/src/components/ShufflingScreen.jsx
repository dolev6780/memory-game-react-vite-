import React from "react";
import { motion } from "framer-motion";

const ShufflingScreen = ({ characters, shuffling, styles }) => {
  // Card animation variants
  const cardVariants = {
    shuffle: (index) => ({
      rotateY: [0, 180, 0],
      rotateZ: [0, index % 2 === 0 ? 5 : -5, 0],
      y: [0, -10, 0],
      scale: [1, 1.05, 0.95, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        repeatType: "loop",
        delay: index * 0.05,
      },
    }),
    idle: {
      rotateY: 0,
      rotateZ: 0,
      y: 0,
      scale: 1,
    },
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-black bg-opacity-80 rounded-xl backdrop-blur-md shadow-2xl border border-gray-800">
      <motion.h2
        className="text-xl sm:text-2xl font-bold text-yellow-400 mb-6"
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.8, 1, 0.8],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      >
        Shuffling Cards...
      </motion.h2>

      <div style={styles.container}>
        <div style={styles.cardGrid}>
          {Array.from({ length: characters.length * 2 }).map((_, index) => (
            <motion.div
              key={index}
              style={styles.card}
              variants={cardVariants}
              animate={shuffling ? "shuffle" : "idle"}
              custom={index}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "#ff9800",
                  background: "linear-gradient(135deg, #ff9800, #e65100)",
                  border: "2px solid #e65100",
                  borderRadius: "8px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
                }}
              >
                <div
                  className="rounded-full bg-orange-600 flex items-center justify-center text-white font-bold shadow-inner"
                  style={{
                    width: "40%",
                    height: "40%",
                    fontSize: styles.fontSize.title,
                    boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
                  }}
                >
                  DB
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        className="mt-6 text-sm text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Preparing an exciting memory challenge...
      </motion.div>
    </div>
  );
};

export default ShufflingScreen;