import { useEffect, useState } from 'react';
import './../../shared/css/sweetAlert.css';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { modalCloseEvent } from '../events/modalEvents';

interface IButtonProps {
	Text: string;
	variant?: "text" | "outlined" | "contained";
	color?: "inherit" | "primary" | "secondary" | "success" | "error" | "info" | "warning";
}

export interface IModalProps {
	id?: string;
	p?: number;
	py?: number;
	px?: number;
	open: boolean;
	onClose: () => void;
	title: string;
	fullWidth?: boolean;
	cancelButton?: boolean;
	submitButton?: boolean;
	submit?: () => Promise<void>;
	submitButtonProps?: IButtonProps;
	ModalContent?: React.ReactNode;
	maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<IModalProps> = ({
	p,
	py = 3,
	px = 1,
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
	id = title,
}) => {
	const [loading, setLoading] = useState(false);

	const handleClose = () => {
		onClose();
	};

	const handleSubmit = async () => {
		try {
			setLoading(true);
			if (submit) {
				await submit();
			}
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const unsubscribe = modalCloseEvent.on((target) => {
			if (target == "*" || target == id) {
				handleClose();
			}
		});
		return unsubscribe; // remove listener ao desmontar
	}, [id]);

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
				<Box py={py} px={px} p={p}>
					<Typography component="div">
						{ModalContent}
					</Typography>
				</Box>
			</DialogContent>
			<DialogActions>
				{cancelButton && <Button onClick={handleClose}>Cancelar</Button>}
				{
					submitButton &&
					<Button
						disabled={loading}
						onClick={handleSubmit}
						variant={(submitButtonProps && submitButtonProps.variant) || "contained"}
						color={(submitButtonProps && submitButtonProps.color) || "primary"}
					>
						{
							loading ?
								<CircularProgress size={24} color="inherit" />
								:
								((submitButtonProps && submitButtonProps.Text) || "Salvar")
						}
					</Button>
				}
			</DialogActions>
		</Dialog>
	);
}