import './../../shared/css/sweetAlert.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";

interface IButtonProps {
	Text: string;
	variant?: "text" | "outlined" | "contained";
	color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

export interface IModalProps {
	open: boolean;
	onClose: () => void;
	title: string;
	fullWidth?: boolean;
	cancelButton?: boolean;
	submitButton?: boolean;
	submit?: () => void;
	submitButtonProps?: IButtonProps;
	ModalContent?: React.ReactNode;
	maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<IModalProps> = ({
	open,
	submit,
	onClose,
	title,
	fullWidth = true,
	cancelButton = true,
	submitButton = true,
	submitButtonProps,
	ModalContent,
	maxWidth = 'lg',
}) => {
	const handleClose = () => {
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			fullWidth={fullWidth}
			maxWidth={maxWidth}
			sx={{
				"& .MuiDialog-paper": { backgroundColor: "#fff" },
			}}
		>
			<DialogTitle>{title}</DialogTitle>
			<DialogContent>
				<Box py={3} px={1}>
					<Typography component="p">
						{ModalContent}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				{cancelButton && <Button onClick={handleClose}>Cancelar</Button>}
				{
					submitButton &&
					<Button
						onClick={submit}
						variant={(submitButtonProps && submitButtonProps.variant) || "contained"}
						color={(submitButtonProps && submitButtonProps.color) || "primary"}
					>
						{(submitButtonProps && submitButtonProps.Text) || "Salvar"}
					</Button>
				}
			</DialogActions>
		</Dialog>
	);
}