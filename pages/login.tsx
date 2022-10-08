import { useState, useRef, SyntheticEvent } from "react";
import { useRouter } from "next/router";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "../firebase.config";
import { debounce } from "../helpers";
import { useMutation } from "react-query";
import axios from "axios";

export default function Login() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }

  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  );
  // const { data } = useLogin();

  // const [createAccount, setCreateAccount] = useState(false);
  // const [usernameExists, setUsernameExists] = useState(null);
  // const [usernameAvailable, setUsernameAvailable] = useState(null);
  // const [values, setValues] = useState({
  //   username: '',
  //   password: '',
  // });
  // const [userDocData, setUserDocData] = useState(null);

  // const handleChange = (e) => {
  //   values.password = e.target.value;
  //   setValues({ ...values });
  //   console.log(values);
  // };

  // const usernameRef = useRef<HTMLInputElement>();
  // const passwordRef = useRef<HTMLInputElement>();

  // const router = useRouter();

  // const mutation = useMutation(
  //   (bool: { loggedIn: true }) => {
  //     return axios.patch('/api/login', bool);
  //   },
  //   {
  //     onSuccess: (data) => {
  //       if (data.data.loggedIn.loggedIn === true) router.push('/');
  //     },
  //   }
  // );

  // const checkUsername = (e) => {
  //   values.username = e.target.value;
  //   setValues({ ...values });
  //   const { username } = values;

  //   onSnapshot(query(collection(db, 'users'), orderBy('username')), (snap) => {
  //     const users = snap.docs.map((doc) => doc.data().username === username);

  //     if (users.includes(true) && username.length > 0) {
  //       setUsernameAvailable(false);
  //       setUsernameExists(true);
  //     } else if (!users.includes(true) && username.length > 0) {
  //       setUsernameExists(false);
  //       setUsernameAvailable(true);
  //     } else if (username.length === 0) {
  //       setUsernameAvailable(false);
  //       setUsernameExists(false);
  //     }
  //   });
  // };

  // const create = async () => {
  //   if (!usernameAvailable) return;
  //   const { username, password } = values;
  //   await axios
  //     .post('api/hashpw', {
  //       password,
  //     })
  //     .then(async (res) => {
  //       const hashedPassword = res.data.hashpw;
  //       await addDoc(collection(db, 'users'), {
  //         username,
  //         password: hashedPassword,
  //       })
  //         .then((res) => console.log({ message: 'success' }))
  //         .catch((err) => console.log(err));
  //     });
  // };

  // const login = async (e: SyntheticEvent) => {
  //   e.preventDefault();

  //   const { username, password } = values;

  //   const q = query(collection(db, 'users'), where('username', '==', username));

  //   const querySnapshot = await getDocs(q);

  //   querySnapshot.forEach(async (doc) => {
  //     const userData = doc.data();

  //     if (userData.username === username) {
  //       const hashpw = userData.password;
  //       const userId = doc.id;

  //       const loginUser = { username, password, hashpw, userId };

  //       try {
  //         const { data } = await axios.post('/api/login', loginUser);
  //         console.log(data);
  //       } catch (err) {
  //         console.log(err);
  //       }
  //     }
  //   });

  //   // mutation.mutate({ loggedIn: true });
  // };

  // return (
  //   <div className="h-screen relative flex flex-col justify-center items-center bg-gradient-to-r from-gray-800 to-gray-600 text-gray-200">
  //     <h1 className="font-semibold text-[50px] top-10 absolute">Dope Chat</h1>
  //     <div className="bg-gradient-to-r from-gray-700 to-gray-500 rounded-md h-[400px] w-[500px] shadow-lg flex flex-col items-center">
  //       <h1 className="text-[30px] p-5 border-b-2 w-full text-center">
  //         {createAccount ? 'Create Account' : 'Login'}
  //       </h1>
  //       <form className="flex flex-col w-80 pt-14 space-y-10">
  //         <div>
  //           <input
  //             placeholder="Username"
  //             className={`w-full bg-transparent outline-none px-5 py-2 border rounded
  //             ${usernameExists && 'border-red-500'}
  //             ${usernameAvailable && 'border-green-500'}`}
  //             onChange={debounce((e) => checkUsername(e))}
  //             required
  //           ></input>
  //           {usernameAvailable && (
  //             <p className="text-green-500">Username Available!</p>
  //           )}
  //           {usernameExists && (
  //             <p className="text-red-500">Username already exists.</p>
  //           )}
  //         </div>
  //         <input
  //           placeholder="Password"
  //           className="bg-transparent outline-none px-5 py-2 border rounded"
  //           onChange={handleChange}
  //           required
  //         ></input>
  //       </form>
  //       <div className="flex justify-between items-center w-80 mt-10">
  //         {createAccount ? (
  //           <button onClick={create} className="bg-gray-800 rounded py-2 px-4">
  //             Create
  //           </button>
  //         ) : (
  //           <button onClick={login} className="bg-gray-800 rounded py-2 px-4">
  //             Login
  //           </button>
  //         )}
  //         <button onClick={() => setCreateAccount(!createAccount)}>
  //           {createAccount ? 'Go to login' : 'Create Account'}
  //         </button>
  //       </div>
  //     </div>
  //   </div>
  // );
}
