import app from "../../firebase/firebaseApp";
import {
  getFirestore,
  collection,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import { async } from "@firebase/util";
import { timeStamp } from "../../utils/dateFunctions";

const db = getFirestore(app);

const createUser = async (address) => {
  const user = {
    username: "",
    about: "",
    profilePic: "",
    library: [],
    myBooks: [],
    address: address,
  };
  var data = {};
  const userData = await getDocs(collection(db, "users"));
  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data();
  });
  if (data[address]) {
    console.log("User already registered");
  } else {
    await setDoc(doc(db, "users", address), user);
  }
};

const updateUserProfile = async (username, about, profilePic, address) => {
  var data = {};
  const userData = await getDocs(collection(db, "users"));
  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data();
  });
  var temp = data[address];
  temp.about = about;
  temp.username = username;
  temp.profilePic = profilePic;
  await setDoc(doc(db, "users", address), temp);
};

const uploadBook = async (title, synopsis, cover, author, owner, bookId) => {
  var data1 = {};
  var data2 = {};
  const bookData = await getDocs(collection(db, "data"));
  const userData = await getDocs(collection(db, "users"));
  bookData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data1[doc.id] = doc.data().data;
  });

  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data2[doc.id] = doc.data();
  });

  const bookDetails = {
    bookId: bookId,
    title: title,
    synopsis: synopsis,
    cover: cover,
    author: author,
    owner: owner,
    chapters: [],
    rating: 0,
    ratings: [],
    raters: [],
    reviews: [],
    created: timeStamp(),
    chapterPrice: 0,
    status: "ongoing",
  };

  for (var i = 0; i < bookId; i++) {
    if (data1["books"][i]) {
      // data1["books"][i] = data1["books"][i];
    } else {
      data1["books"].push("first");
    }
  }
  data1["books"].push(bookDetails);

  for (var i = 0; i < bookId; i++) {
    if (data2[owner].myBooks[i]) {
    } else {
      data2[owner].myBooks.push("first");
    }
  }
  data2[owner].myBooks.push(bookDetails);

  var allBooks = data1["books"];
  allBooks[bookId] = bookDetails;

  var authorData = data2[owner];
  authorData.myBooks[bookId] = bookDetails;

  console.log(allBooks);
  console.log(allBooks.length);
  console.log(authorData);

  await setDoc(doc(db, "data", "books"), { data: allBooks });
  await setDoc(doc(db, "users", owner), authorData);
};

const addToLibrary = async (book, owner) => {
  var data = {};
  const userData = await getDocs(collection(db, "users"));

  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data();
  });

  var authorData = data[owner];
  authorData.library.push(book);

  await setDoc(doc(db, "users", owner), authorData);
};

const addToRecent = async (chapter) => {
  var data = {};
  const recentData = await getDocs(collection(db, "recent"));

  recentData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data().data;
  });

  if (data["recent"].length < 10) {
    data["recent"].unshift(chapter);
  } else {
    data["recent"].unshift(chapter);
    data["recent"].pop();
  }

  await setDoc(doc(db, "recent", "recent"), { data: data["recent"] });
};

const getRecent = async () => {
  var data = {};
  const recentData = await getDocs(collection(db, "recent"));

  recentData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data().data;
  });
  const recentChapters = data["recent"];
  return recentChapters;
};

const uploadChapter = async (bookId, chapter, title, owner, content) => {
  var data1 = {};
  var data2 = {};
  const bookData = await getDocs(collection(db, "data"));
  const userData = await getDocs(collection(db, "users"));
  bookData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data1[doc.id] = doc.data().data;
  });

  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data2[doc.id] = doc.data();
  });

  const chapterDetails = {
    bookId,
    chapter,
    title,
    created: timeStamp(),
    content,
  };

  for (var i = 0; i < chapter; i++) {
    if (data1["books"][bookId].chapters[i]) {
      // data1["books"][i] = data1["books"][i];
    } else {
      data1["books"][bookId].chapters.push("first");
    }
  }
  data1["books"][bookId].chapters.push(chapterDetails);

  for (var i = 0; i < chapter; i++) {
    if (data2[owner].myBooks[bookId].chapters[i]) {
      // data2[owner][i] = data2[owner][i];
    } else {
      data2[owner].myBooks[bookId].chapters.push("first");
    }
  }
  data2[owner].myBooks[bookId].chapters.push(chapterDetails);

  var allBooks = data1["books"];
  allBooks[bookId].chapters[chapter] = chapterDetails;

  var authorData = data2[owner];
  authorData.myBooks[bookId].chapters[chapter] = chapterDetails;

  await setDoc(doc(db, "data", "books"), { data: allBooks });
  await setDoc(doc(db, "users", owner), authorData);
  await addToRecent(chapterDetails);
};

const getUserDetails = async (address) => {
  var data = {};
  const userData = await getDocs(collection(db, "users"));
  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data();
  });
  const details = data[address];
  return details;
};

const getAllBooks = async () => {
  var data = {};
  const bookData = await getDocs(collection(db, "data"));
  bookData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data().data;
  });
  var books = data["books"];
  return books;
};

const getBookDetails = async (bookId) => {
  var data = {};
  const bookData = await getDocs(collection(db, "data"));
  bookData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data().data;
  });
  var book = data["books"][bookId];
  return book;
};

const checkIfUserExists = async (user) => {
  var data = {};
  const userData = await getDocs(collection(db, "users"));
  userData.forEach((doc) => {
    // doc.data() is never undefined for query doc snapshots
    data[doc.id] = doc.data();
  });
  var state = false;
  const addresses = Object.keys(data);
  addresses.map((address) => {
    if (address === user) state = true;
  });
  return state;
};

const rate = async (rating, user) => {};

export {
  createUser,
  updateUserProfile,
  uploadBook,
  uploadChapter,
  getUserDetails,
  getAllBooks,
  getBookDetails,
  checkIfUserExists,
  db,
  addToLibrary,
  addToRecent,
  getRecent,
};
