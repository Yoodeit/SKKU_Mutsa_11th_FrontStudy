console.clear();

// # 임포트 시작

const { useState, useRef, useEffect, useMemo } = React;

import classNames from "https://cdn.skypack.dev/classnames";

import { produce } from "https://cdn.skypack.dev/immer";

const {
  RecoilRoot,
  atom,
  atomFamily,
  useRecoilState,
  useSetRecoilState,
  useRecoilValue
} = Recoil;

import { recoilPersist } from "https://cdn.skypack.dev/recoil-persist";

const {
  HashRouter: Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useParams,
  useNavigate,
  useLocation
} = ReactRouterDOM;

const {
  colors,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Link,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Chip,
  Box,
  SwipeableDrawer,
  List,
  ListItem,
  Divider,
  Modal,
  Snackbar,
  Alert: MuiAlert,
  Tabs,
  Tab
} = MaterialUI;
// # 임포트 끝

// # 유틸리티 시작

// 날짜 객체 입력받아서 문장(yyyy-mm-dd hh:mm:ss)으로 반환한다.
function dateToStr(d) {
  const pad = (n) => {
    return n < 10 ? "0" + n : n;
  };

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds())
  );
}

// # 유틸리티 끝

// # 비지니스 로직 변수 세팅 시작
const userCode = window.location.hostname;
const API_TODOS_URL = `http://localhost:3000/${userCode}/todos`;
// # 비지니스 로직 변수 세팅 끝

// # 리코일 퍼시스트 저장소 시작
const { persistAtom: persistAtomCommon } = recoilPersist({
  key: "persistAtomCommon"
});

// # 리코일 퍼시스트 저장소 끝

// # 유틸리티 컴포넌트 시작
// ## 커스텀 스낵바 시작
const noticeSnackbarInfoAtom = atom({
  key: "app/noticeSnackbarInfoAtom",
  default: {
    opened: false,
    autoHideDuration: 0,
    severity: "",
    msg: ""
  }
});

function useNoticeSnackbarStatus() {
  const [noticeSnackbarInfo, setNoticeSnackbarInfo] = useRecoilState(
    noticeSnackbarInfoAtom
  );

  const opened = noticeSnackbarInfo.opened;
  const autoHideDuration = noticeSnackbarInfo.autoHideDuration;
  const severity = noticeSnackbarInfo.severity;
  const msg = noticeSnackbarInfo.msg;

  const open = (msg, severity = "success", autoHideDuration = 6000) => {
    setNoticeSnackbarInfo({
      opened: true,
      msg,
      severity,
      autoHideDuration
    });
  };

  const close = () => {
    setNoticeSnackbarInfo({
      ...noticeSnackbarInfo,
      opened: false
    });
  };

  return {
    opened,
    open,
    close,
    autoHideDuration,
    severity,
    msg
  };
}

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert {...props} ref={ref} variant="filled" />;
});

function NoticeSnackbar() {
  const status = useNoticeSnackbarStatus();

  return (
    <>
      <Snackbar
        open={status.opened}
        autoHideDuration={status.autoHideDuration}
        onClose={status.close}
      >
        <Alert severity={status.severity}>{status.msg}</Alert>
      </Snackbar>
    </>
  );
}
// ## 커스텀 스낵바 끝

// # 유틸리티 컴포넌트 끝

// # 비지니스 로직 시작

// ## todosStatus 시작
const todosAtom = atom({
  key: "app/todosAtom",
  default: []
});

function useTodosStatus() {
  const [todos, setTodos] = useRecoilState(todosAtom);

  useEffect(async () => {
    const data = await fetch(`${API_TODOS_URL}`);
    const dataJson = await data.json();
    const newTodos = dataJson.data.map((todo) => ({
      no: todo.no,
      regDate: todo.reg_date,
      updateDate: todo.update_date,
      performDate: todo.perform_date,
      content: todo.content,
      completed: todo.is_completed === 1
    }));
    setTodos(newTodos);
  }, []);

  const addTodo = async (performDate, newContent) => {
    const fetchRs = await fetch(`${API_TODOS_URL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        perform_date: dateToStr(new Date(performDate)),
        content: newContent,
        is_completed: 0
      })
    });

    const fetchRsJson = await fetchRs.json();

    const no = fetchRsJson.data.no;

    const newTodo = {
      no,
      regDate: fetchRsJson.data.reg_date,
      performDate: fetchRsJson.data.perform_date,
      content: fetchRsJson.data.content,
      completed: fetchRsJson.data.is_completed === 1
    };

    setTodos((todos) => [newTodo, ...todos]);

    return no;
  };

  const modifyTodo = (index, performDate, content) => {
    const newTodos = produce(todos, (draft) => {
      draft[index].performDate = dateToStr(new Date(performDate));
      draft[index].content = content;
    });
    setTodos(newTodos);
  };

  const modifyTodoByNo = (no, performDate, newContent) => {
    const index = findTodoIndexByNo(no);

    if (index == -1) {
      return;
    }

    modifyTodo(index, performDate, newContent);
  };

  const removeTodo = (index) => {
    const newTodos = todos.filter((_, _index) => _index != index);
    setTodos(newTodos);
  };

  const toggleTodoCompletedByNo = (no) => {
    const index = findTodoIndexByNo(no);

    if (index == -1) {
      return;
    }

    setTodos(
      produce(todos, (draft) => {
        draft[index].completed = !draft[index].completed;
      })
    );
  };

  const removeTodoByNo = (no) => {
    const index = findTodoIndexByNo(no);

    if (index != -1) {
      removeTodo(index);
    }
  };

  const findTodoIndexByNo = (no) => {
    return todos.findIndex((todo) => todo.no == no);
  };

  const findTodoByNo = (no) => {
    const index = findTodoIndexByNo(no);

    if (index == -1) {
      return null;
    }

    return todos[index];
  };

  return {
    todos,
    addTodo,
    modifyTodo,
    modifyTodoByNo,
    toggleTodoCompletedByNo,
    removeTodo,
    removeTodoByNo,
    findTodoByNo
  };
}
// ## todosStatus 끝

// # 비지니스 로직 끝

// # 공통 컴포넌트 시작

// # 공통 컴포넌트 끝

// # 페이지들 시작

// ## 메인 페이지관련 컴포넌트 시작
function TodosEmpty() {
  const [stack, setStack] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [todayLogs, setTodayLogs] = useState([]);

  const handlePush = () => {
    const now = dateToStr(new Date());
    const valueToAdd = now;
    if (valueToAdd.trim() !== "") {
      setStack([...stack, valueToAdd]);
      setErrorMessage("");
    } else {
      setErrorMessage("Please enter a value.");
    }
  };
  const handlePop = () => {
    if (stack.length > 0) {
      const newStack = [...stack];
      newStack.pop();
      setStack(newStack);
      setErrorMessage("");
    } else {
      setErrorMessage("Stack is empty.");
    }
  };

  const handleStackSave = () => {
    localStorage.setItem("stack", JSON.stringify(stack));
  };

  return (
    <>
      <div className="flex-1 flex justify-center items-center">
        <div className="grid gap-2">
          <span>
            <span className="text-[color:var(--mui-color-primary-main)]">
              행복
            </span>
            을 느꼈나요?
          </span>
          <Button onClick={handlePush} variant="contained" size="large">
            행복해요
          </Button>
          <Button onClick={handlePop} variant="contained" size="small">
            {" "}
            실수로 눌렀어요
          </Button>
          <Button
            size="small"
            variant="contained"
            component={NavLink}
            to="/write"
            onClick={handleStackSave}
          >
            오늘의 행복 기록하기
          </Button>
          <Button
            size="small"
            variant="contained"
            component={NavLink}
            to="/log"
          >
            행복기록 보기
          </Button>

          <ul>
            {stack.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

const TodoList__filterCompletedIndexAtom = atom({
  key: "app/TodoList__filterCompletedIndexAtom",
  default: 0,
  effects_UNSTABLE: [persistAtomCommon]
});

const TodoList__sortIndexAtom = atom({
  key: "app/TodoList__sortIndexAtom",
  default: 0,
  effects_UNSTABLE: [persistAtomCommon]
});

function TodoList() {
  const todosStatus = useTodosStatus();
  const todoOptionDrawerStatus = useTodoOptionDrawerStatus();
  const onCompletedBtnClicked = (no) => todosStatus.toggleTodoCompletedByNo(no);

  const [filterCompletedIndex, setFilterCompletedIndex] = useRecoilState(
    TodoList__filterCompletedIndexAtom
  );

  const [sortIndex, setSortIndex] = useRecoilState(TodoList__sortIndexAtom);

  const getFilteredTodos = () => {
    if (filterCompletedIndex == 1)
      return todosStatus.todos.filter((todo) => !todo.completed);

    if (filterCompletedIndex == 2)
      return todosStatus.todos.filter((todo) => todo.completed);

    return todosStatus.todos;
  };

  const filteredTodos = getFilteredTodos();

  const getSortedTodos = () => {
    if (sortIndex == 0) {
      return [...filteredTodos].sort((a, b) => {
        if (a.performDate == b.performDate) return 0;

        return a.performDate > b.performDate ? 1 : -1;
      });
    } else if (sortIndex == 1) {
      return [...filteredTodos].sort((a, b) => {
        if (a.performDate == b.performDate) return 0;

        return a.performDate < b.performDate ? 1 : -1;
      });
    } else if (sortIndex == 2) {
      return [...filteredTodos].sort((a, b) => {
        return a.no > b.no ? 1 : -1;
      });
    }

    return filteredTodos;
  };

  const sortedTodos = getSortedTodos();

  return (
    <>
      <TodoOptionDrawer status={todoOptionDrawerStatus} />

      <Tabs
        variant="fullWidth"
        value={filterCompletedIndex}
        onChange={(event, newValue) => setFilterCompletedIndex(newValue)}
      >
        <Tab
          label={
            <span className="flex">
              <i className="fa-solid fa-list-ul"></i>
              <span className="ml-2">전체</span>
            </span>
          }
          value={0}
        />
        <Tab
          label={
            <span className="flex">
              <i className="fa-regular fa-square"></i>
              <span className="ml-2">미완료</span>
            </span>
          }
          value={1}
        />
        <Tab
          label={
            <span className="flex">
              <i className="fa-regular fa-square-check"></i>
              <span className="ml-2">완료</span>
            </span>
          }
          value={2}
        />
      </Tabs>

      <Tabs
        variant="scrollable"
        value={sortIndex}
        onChange={(event, newValue) => {
          setSortIndex(newValue);
        }}
      >
        <Tab
          className="flex-grow !max-w-[none] px-4"
          label={
            <span className="flex items-baseline">
              <i className="fa-regular fa-clock mr-2"></i>
              <span className="mr-2 whitespace-nowrap">급해요</span>
              <i className="fa-solid fa-sort-up relative top-[3px]"></i>
            </span>
          }
          value={0}
        />
        <Tab
          className="flex-grow !max-w-[none] px-4"
          label={
            <span className="flex items-baseline">
              <i className="fa-regular fa-clock mr-2"></i>
              <span className="mr-2 whitespace-nowrap">널럴해요</span>
              <i className="fa-solid fa-sort-down relative top-[-3px]"></i>
            </span>
          }
          value={1}
        />
        <Tab
          className="flex-grow !max-w-[none] px-4"
          label={
            <span className="flex items-baseline">
              <i className="fa-solid fa-pen mr-2"></i>
              <span className="mr-2 whitespace-nowrap">작성순</span>
              <i className="fa-solid fa-sort-up relative top-[3px]"></i>
            </span>
          }
          value={2}
        />
        <Tab
          className="flex-grow !max-w-[none] px-4"
          label={
            <span className="flex items-baseline">
              <i className="fa-solid fa-pen mr-2"></i>
              <span className="mr-2 whitespace-nowrap">작성순</span>
              <i className="fa-solid fa-sort-down relative top-[-3px]"></i>
            </span>
          }
          value={3}
        />
      </Tabs>

      <div className="px-6 sm:px-8 pb-6 sm:pb-8">
        <ul>
          {sortedTodos.map((todo, index) => (
            <TodoListItem
              key={todo.no}
              todo={todo}
              index={index}
              onCompletedBtnClicked={onCompletedBtnClicked}
              openDrawer={todoOptionDrawerStatus.open}
            />
          ))}
        </ul>
      </div>
    </>
  );
}

function TodoListItem({ onCompletedBtnClicked, todo, index, openDrawer }) {
  return (
    <>
      <li key={todo.no} className="mt-6 sm:mt-8">
        <div className="flex gap-2">
          <Chip
            label={`번호 : ${todo.no}`}
            variant="outlined"
            className="!pt-1"
          />
          <Chip
            label={todo.performDate.substr(2, 14)}
            color="primary"
            variant="outlined"
            className="!pt-1"
          />
        </div>
        <div className="mt-2 sm:mt-4 shadow rounded-[20px] flex">
          <Button
            className="flex-shrink-0 !items-start !rounded-[20px_0_0_20px]"
            color="inherit"
            onClick={() => onCompletedBtnClicked(todo.no)}
          >
            <span
              className={classNames(
                "text-4xl",
                "h-[80px]",
                "flex items-center",
                {
                  "text-[color:var(--mui-color-primary-main)]": todo.completed
                },
                { "text-[#dcdcdc]": !todo.completed }
              )}
            >
              <i className="fa-solid fa-check"></i>
            </span>
          </Button>
          <div className="flex-shrink-0 my-5 w-[2px] bg-[#dcdcdc] mr-4"></div>
          <div className="whitespace-pre-wrap leading-relaxed hover:text-[color:var(--mui-color-primary-main)] flex-grow flex items-center my-5">
            {todo.content}
          </div>
          <Button
            onClick={() => openDrawer(todo.no)}
            className="flex-shrink-0 !items-start !rounded-[0_20px_20px_0]"
            color="inherit"
          >
            <span className="text-[#dcdcdc] text-2xl h-[80px] flex items-center">
              <i className="fa-solid fa-ellipsis-vertical"></i>
            </span>
          </Button>
        </div>
      </li>
    </>
  );
}

// ## 메인 페이지 시작
function MainPage() {
  const todosStatus = useTodosStatus();

  const todosEmpty = todosStatus.todos.length == 0;

  if (todosEmpty) {
    return <TodosEmpty />;
  }

  return (
    <>
      <TodoList />
    </>
  );
}
// ## 메인 페이지 끝

// ## 글쓰기 페이지 시작
function WritePage() {
  const [stack, setStack] = useState([]);
  const [logs, setLogs] = useState([]);
  useEffect(() => {
    const storedStack = localStorage.getItem("stack");
    if (storedStack) {
      setStack(JSON.parse(storedStack));
    }
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    const content = e.target.elements.content.value.trim();
    if (!content) {
      return;
    }
    const log = {
      date: new Date().toLocaleDateString(),
      stack: [...stack, content],
      happy: content
    };
    handleAddLog(log);
  };

  const handleAddLog = (log) => {
    const newStack = [...stack, log.happy];
    setStack(newStack);
    localStorage.setItem("stack", JSON.stringify(newStack));

    const storedLogs = localStorage.getItem("logs");
    const logs = storedLogs ? JSON.parse(storedLogs) : [];
    const newLogs = [...logs, log];
    setLogs(newLogs);
    localStorage.setItem("logs", JSON.stringify(newLogs));
  };

  return (
    <div className="flex-1 flex justify-center items-center">
      <ul>
        <h2>오늘의 행복스택</h2>
        {stack.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
      <form onSubmit={onSubmit}>
        <TextField
          name="content"
          label="오늘 하루 어떤 행복을 느꼈나요?"
          multiline
        />
        <Button type="submit" variant="contained">
          <i className="fa-solid fa-marker"></i>
          <span>&nbsp;</span>
          <span>행복 저장</span>
        </Button>
        <Button
          onClick={handleAddLog}
          variant="contained"
          component={NavLink}
          to="/log"
        >
          <i className="fa-solid fa-calendar"></i>
          <span>&nbsp;</span>
          <span>행복기록 보기</span>
        </Button>
      </form>
    </div>
  );
}
// ## 글쓰기 페이지 끝

// ## 글수정 페이지관련 컴포넌트 시작

// ## 글수정 페이지관련 컴포넌트 끝

function LogPage() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const storedLogs = localStorage.getItem("logs");
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  const handleAddLog = (log) => {
    const newLogs = [...logs, log];
    setLogs(newLogs);
    localStorage.setItem("logs", JSON.stringify(newLogs));
  };

  const handleDeleteLog = (index) => {
    const newLogs = [...logs];
    newLogs.splice(index, 1);
    setLogs(newLogs);
    localStorage.setItem("logs", JSON.stringify(newLogs));
  };
  return (
    <div>
      <h1 className="flex-1 flex justify-center items-center">행복 기록</h1>
      <div className="flex flex-wrap">
        {logs.map((log, index) => (
          <div key={index} className="w-1/3 p-2">
            <div className="border border-gray-300 rounded-md p-2">
              <div className="flex justify-between items-center">
                <h2 className="font-bold">{log.date}</h2>
                <button
                  className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-2 rounded-md"
                  onClick={() => handleDeleteLog(index)}
                >
                  삭제
                </button>
              </div>
              <ul className="mt-2">
                {log.stack.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className="mt-2"></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

//##로그 페이지 끝
// # 페이지들 끝

// # 앱 세팅 시작
function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [stack, setStack] = useState([]);

  return (
    <>
      <AppBar position="fixed">
        <Toolbar>
          <NavLink
            to="/main"
            className="font-bold select-none self-stretch flex items-center mr-auto"
          >
            CAPPINESS
          </NavLink>

          {location.pathname != "/main" && (
            <span
              className="select-none cursor-pointer self-stretch flex items-center"
              onClick={() => navigate(-1)}
            >
              전으로
            </span>
          )}
        </Toolbar>
      </AppBar>
      <Toolbar />
      <NoticeSnackbar />
      <Routes>
        <Route path="/main" element={<MainPage />} />
        <Route path="/write" element={<WritePage />} />
        <Route path="/log" element={<LogPage />} />
        <Route path="*" element={<Navigate to="/main" />} />
      </Routes>
    </>
  );
}

const muiThemePaletteKeys = [
  "background",
  "common",
  "error",
  "grey",
  "info",
  "primary",
  "secondary",
  "success",
  "text",
  "warning"
];

function Root() {
  // Create a theme instance.
  const theme = createTheme({
    typography: {
      fontFamily: ["GmarketSansMedium"]
    },
    // 앱 테마
    palette: {
      primary: {
        main: "#FF9500",
        contrastText: "#ffffff"
      }
    }
  });

  useEffect(() => {
    const r = document.querySelector(":root");

    muiThemePaletteKeys.forEach((paletteKey) => {
      const themeColorObj = theme.palette[paletteKey];

      for (const key in themeColorObj) {
        if (Object.hasOwnProperty.call(themeColorObj, key)) {
          const colorVal = themeColorObj[key];
          r.style.setProperty(`—mui-color-${paletteKey}-${key}`, colorVal);
        }
      }
    });
  }, []);

  return (
    <RecoilRoot>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <App />
        </ThemeProvider>
      </Router>
    </RecoilRoot>
  );
}

ReactDOM.render(<Root />, document.getElementById("root"));
// # 앱 세팅 끝
