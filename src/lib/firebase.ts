/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD0OHh6KlyTM91OGf9YJeumDUOCPirHuNw",
  authDomain: "cvav-bd9b8.firebaseapp.com",
  projectId: "cvav-bd9b8",
  storageBucket: "cvav-bd9b8.firebasestorage.app",
  messagingSenderId: "364326188732",
  appId: "1:364326188732:web:79bfad21a0f19ed08c82b9"
};

const app = initializeApp(firebaseConfig);
// Using custom database id provided in config
const db = getFirestore(app, "(default)");

export { app, db };
