import { useState } from "react";
import { Box, BoxProps } from "@mui/material";
import { IModalProps, Modal } from './Modal';

interface IModalBoxProps extends BoxProps {
	onClose?: () => void;
	children?: React.ReactNode;
	modalProps: Omit<IModalProps, 'open' | 'onClose'>;
}

export const ModalBox: React.FC<IModalBoxProps> = ({ onClose, children, modalProps, ...boxProps }) => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setOpen(false);
		onClose?.();
	};
	return (
		<>
			<Box
				{...boxProps}
				onClick={handleOpen}
			>
				{children}
			</Box>
			<Modal open={open} onClose={handleClose} {...modalProps} />
		</>
	)
}