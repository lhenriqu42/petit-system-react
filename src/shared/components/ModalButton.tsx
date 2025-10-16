import { useState } from "react";
import { Button, } from "@mui/material";
import { IModalProps, Modal } from './Modal';

interface IModalButtonProps {
	children?: React.ReactNode;
	modalProps: Omit<IModalProps, 'open' | 'onClose'>;
}

export const ModalButton: React.FC<IModalButtonProps> = ({ children, modalProps }) => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);
	return (
		<>
			<Button
				variant="contained"
				onClick={handleOpen}
			>
				{children}
			</Button>
			<Modal open={open} onClose={handleClose} {...modalProps} />
		</>
	)
}