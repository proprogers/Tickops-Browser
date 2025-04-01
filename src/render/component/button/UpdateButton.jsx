import { Chip } from "@mui/material";
import MoreVert from "@mui/icons-material/MoreVert";
import { keyframes } from "@mui/system";

const blinkAnimation = keyframes`
    0% { background-color: #ff4747; }
    50% { background-color: #fa9d9d; }
    100% { background-color: #ff4747; }
`;

export default function UpdateButton({ onUpdate, onDelete }) {
    return (
        <Chip
            label="UPDATE"
            onClick={onUpdate}
            onDelete={onDelete}
            deleteIcon={<MoreVert />}
            variant="outlined"
            color="warning"
            sx={{
                fontSize: "14px",
                fontWeight: "bold",
                border: "1px solid red",
                color: "white",
                animation: `${blinkAnimation} 1.5s infinite alternate`,
            }}
        />
    );
}