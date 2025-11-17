import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import {AuthProvider} from "../lib/auth/context.tsx";

import App from "../app/App.tsx";

// Layout và style toàn cục
import "../app/globals.css"

const rootElement = document.getElementById("root") as HTMLElement | null
if(!rootElement) throw new Error('Root element with id "root" not found in index.html')

ReactDOM.createRoot(rootElement).render(
    <BrowserRouter>
            <AuthProvider>
                <App />
            </AuthProvider>
    </BrowserRouter>
)