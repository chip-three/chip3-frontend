import { motion } from "framer-motion";
import React from "react";

const LayoutAnimation = (props) => {
  // this is page animation
  // enter from left
  // exit to up
  return (
    <motion.div
      initial={{ opacity: 0, x: 200 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, y: -100 }}
    >
      {props.children}
    </motion.div>
  );
};

export default LayoutAnimation;
