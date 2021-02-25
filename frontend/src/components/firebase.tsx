import firebase from 'firebase/app';
import "firebase/analytics";

const config = {
    apiKey: "AIzaSyBFFWShyFVRpQHjyiKcGmzYHBpR99KQThA",
    authDomain: "kalkulierbar-8eda1.firebaseapp.com",
    databaseURL: "https://kalkulierbar-8eda1.firebaseio.com",
    projectId: "kalkulierbar-8eda1",
    storageBucket: "kalkulierbar-8eda1.appspot.com",
    messagingSenderId: "948203371132",
    appId: "1:948203371132:web:dcf4af320bced9882167f9",
    measurementId: "G-C4F0XJYNS3"
};
firebase.initializeApp(config);

export default firebase;
export const analytics = firebase.analytics();
