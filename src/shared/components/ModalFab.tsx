import { useState } from "react";
import { FabProps, Fab } from "@mui/material";
import { IModalProps, Modal } from './Modal';

interface IModalButtonProps extends FabProps {
	onClick?: () => void;
	onClose?: () => void;
	children?: React.ReactNode;
	modalProps: Omit<IModalProps, 'open' | 'onClose'>;
	backgroundColor?: { default: string; hover: string; };
}

export const ModalFab: React.FC<IModalButtonProps> = ({ onClose, onClick, children, modalProps, backgroundColor, ...fabProps }) => {
	const [open, setOpen] = useState(false);
	const handleOpen = () => {
		setOpen(true);
		onClick?.();
	}
	const handleClose = () => {
		setOpen(false);
		onClose?.();
	};
	return (
		<>
			<Fab
				size="medium"
				color="success"
				{...fabProps}
				onClick={handleOpen}
				sx={{
					backgroundColor: backgroundColor?.default,
					'&:hover': { backgroundColor: backgroundColor?.hover },
				}}
			>
				{children}
			</Fab>
			<Modal open={open} onClose={handleClose} {...modalProps} />
		</>
	)
}