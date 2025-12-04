
import { initializeApp } from "firebase/app";
import { addDoc, collection, deleteDoc, Firestore, getDocs, getFirestore } from 'firebase/firestore'

export function initializeFirebase(firebaseConfig) {
    console.log("conf",firebaseConfig);
    const conf = JSON.parse(firebaseConfig);
    const app = initializeApp(conf,conf.appId);
    const db = getFirestore(app);
    return db;
}

/**
 * 从firebase获取配置的url和vpn，
 * @param {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
} firebaseConfig 
 * @returns Promise<[url,vpns]>;
 */
export function getFirebaseConfig(firebaseConfig) {
    return new Promise((resolve, reject) => {
        const db = initializeFirebase(firebaseConfig);
        const querySnapshot = getDocs(collection(db, "rec"));
        querySnapshot.then((snapshot) => {
            if (snapshot.size > 0) {
                const first = snapshot.docs[0];
                const data = first.data();
                const url = data.u;
                const vpns = data.v;
                resolve([url, vpns]);
            } else {
                resolve([undefined, undefined]);
            }
        }).catch(reject);
    });
}

/**
 * 配置firebase内容
 * @param {*} firebaseConfig 
 * @param {*} url 
 * @param {*} vpns [vpn]
 * @returns 
 */
export async function updateFirebaseConfig(firebaseConfig,url,vpns){
    const db = initializeFirebase(firebaseConfig);
    const querySnapshot = await getDocs(collection(db,"rec"));
    const deletePromises = querySnapshot.docs.map((doc)=>deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    const newDoc = {
        u:url.trim(),
    }
    if(vpns && vpns.length){
        Object.assign(newDoc,{v:vpns.join(",")});
    }
    if(newDoc.u){
        const doc = await addDoc(collection(db,"rec"),newDoc);
    }
    return true;
}