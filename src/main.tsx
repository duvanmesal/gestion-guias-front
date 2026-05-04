import React from "react"
import ReactDOM from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { QueryProvider } from "@/app/providers/query-client"
import { ToastProvider } from "@/shared/components/feedback/Toast"
import { ErrorBoundary } from "@/shared/components/ErrorBoundary"
import { router } from "@/app/router/routes"
import "@/styles/index.css"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ToastProvider>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </ToastProvider>
    </ErrorBoundary>
  </React.StrictMode>,
)
