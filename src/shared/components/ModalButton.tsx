import { useState } from "react";
import { Button, ButtonProps } from "@mui/material";
import { IModalProps, Modal } from './Modal';

interface IModalButtonProps extends ButtonProps {
	onClose?: () => void;
	children?: React.ReactNode;
	modalProps: Omit<IModalProps, 'open' | 'onClose'>;
}

export const ModalButton: React.FC<IModalButtonProps> = ({ onClose, children, modalProps, ...buttonProps }) => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		onClose?.();
	};
	return (
		<>
			<Button
				{...buttonProps}
				variant="contained"
				onClick={handleOpen}
			>
				{children}
			</Button>
			<Modal open={open} onClose={handleClose} {...modalProps} />
		</>
	)
}