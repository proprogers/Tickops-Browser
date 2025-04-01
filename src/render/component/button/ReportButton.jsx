import React from "react";

export default function ReportButton({onClick}) {
    return (
        <button
            onClick={onClick}
            style={{
                position: "fixed",
                bottom: "20px",
                right: "20px",
                padding: "12px 24px",
                backgroundColor: "white",
                color: "#000",
                border: "none",
                borderRadius: "50px",
                cursor: "pointer",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
                fontSize: "16px",
                fontWeight: "500",
            }}
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{marginRight: "4px"}}>
                <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 1.82.487 3.53 1.338 5L2 22l5-1.338A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"
                    fill="#000"
                />
            </svg>
            Report an issue
        </button>
    );
}