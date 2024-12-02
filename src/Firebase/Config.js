import { initializeApp } from 'firebase/app';


const firebaseConfig = {
  apiKey: "AIzaSyAO77iAiNb4mhmSv4eyydNLK7xt3pzOBjk",
  authDomain: "fnb-log-book.firebaseapp.com",
  projectId: "fnb-log-book",
  storageBucket: "fnb-log-book.firebasestorage.app",
  messagingSenderId: "188316810340",
  appId: "1:188316810340:web:c8a35f82a4bc97623fb371"
};
const app = initializeApp(firebaseConfig);
export default app;