/* 그냥 create react app 관련. app.module.css를 사용해서 클래스명을 랜덤으로 지어주는 걸 만들 수가 있다, 그리고 button 이라는 컴포넌트로부터 props 가져오기도 가능이다
import Button from "./Button"; 
import styles from "./App.module.css";

function App() {
  return (
    <div>
      <h1 className={styles.title}>Welcome back!</h1>
      <Button text={"Continue"} />
    </div>
  );
}

export default App;
*/

/* useffect 실습
import { useState } from "react";

function App() {
  const [counter, setValue] = useState(0);
  const onClick = () => setValue((prev) => prev + 1);
  console.log("call an api");
  return (
    <div>
      <h1>{counter}</h1>
      <button onClick={onClick}>click me</button>
    </div>
  )
}

export default App;
*/
import { useEffect, useState } from "react";
function App() {
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState([]); //default값으로 비어있는 array 
  const getMovies = async () => {
    const json = await (await fetch(
      `https://yts.mx/api/v2/list_movies.json?minimum_rating=8.8&sort_by=year`
    )).json();
    setMovies(json.data.movies);
    setLoading(false);
  };
  useEffect(() => {
    getMovies();
  }, []);

  /*그치만 .then보다는 async-await를 더 자주 사용한다.
  useEffect(() => {
    fetch(
      //'http하여간 내가 모르는 앞쪽 강의에서 등장한 api';
    )
    .then(response => response.json())
    //.then(json => console.log(json)); 이걸 아래처럼 바꾼다.
    .then(json => {
      setMovies(json.data.movies); //movies state값을 json.data.movies로 바꾸고
      setLoading(false); //loading state를 false로 바꿔준다.
    });
    
  }, []);
  console.log(movies);
  */
  console.log(movies);
  return <div>
    {loading ? <h1>Loading...</h1> : <div>{movies.map()}</div>}
  </div>;
};
export default App();