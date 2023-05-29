import PropTypes from "prop-types";
import styles from "./Button.module.css";

/* 이런 식으로 css prop을 매번 줄 수도 있지만
function Button({text}){
    return <button style = {{
        backgroundColor:"tomato",
        color:'white',
    }}
    >{text}</button>;
};
*/

//보다 좋은 방식도 존재.
function Button({text}){
    return <button className={styles.btn}>{text}</button>;
};

Button.PropTypes = {
    text: PropTypes.string.isRequired,
};

export default Button; //App.js에서 가져올 수 있게.