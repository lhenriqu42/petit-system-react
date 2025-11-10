import {
	Box,
	Alert,
	Button,
	Typography,
} from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import { ModalButton } from "../../shared/components/ModalButton";
import { CustomTextField } from "../../shared/forms/customInputs/CustomTextField";
import { useState } from "react";
import { PackService } from "../../shared/services/api";
import { listReloadEvent } from "../../shared/events/listEvents";


export const CreatePackModal = () => {
	const [createPackForm, setCreatePackForm] = useState<{ quantity: number }>({ quantity: 0 });
	const [createAlert, setCreateAlert] = useState<{ message: string; color: 'error' | 'success' | 'info' | 'warning' } | null>(null);
	const [createLoading, setCreateLoading] = useState(false);
	const createPack = async () => {
		if (createPackForm.quantity <= 0)
			return setCreateAlert({ message: 'A quantidade deve ser maior que zero.', color: 'warning' });
		setCreateAlert(null);
		setCreateLoading(true);
		try {
			const response = await PackService.create({ prod_qnt: createPackForm.quantity });
			if (response instanceof Error) {
				throw response;
			}
			setCreateAlert({ message: 'Embalagem criada com sucesso!', color: 'success' });
			listReloadEvent.emit('pack-list');
			listReloadEvent.emit('packs-to-relate-modal');

		} catch (error: any) {
			return setCreateAlert({ message: 'Já existe uma embalagem com essa quantidade.', color: 'error' });
		} finally {
			setCreateLoading(false);
		}
	}
	return (
		<ModalButton
			startIcon={<AddIcon />}
			onClose={() => {
				setCreateAlert(null);
				setCreatePackForm({ quantity: 0 });
			}}
			modalProps={{
				maxWidth: 'xs',
				submitButton: false,
				title: 'Adicionar Embalagem',
				ModalContent: (
					<Box display="flex" flexDirection="column" gap={1} border={1} borderColor={'#ccc'} p={2} borderRadius={2}>
						<Typography variant="subtitle1">Informações da Embalagem</Typography>
						{createAlert && <Alert severity={createAlert.color}>{createAlert.message}</Alert>}
						<Box display="flex" alignItems="center" justifyContent={'space-between'}>
							<CustomTextField
								unsigned
								onChange={(e) => setCreatePackForm({ ...createPackForm, quantity: Number(e.target.value) })}
								margin="dense"
								type="number"
								size="small"
								name="quantity"
								label="Quantidade"
								sx={{ width: 150 }}
							/>
							<Button variant="contained"
								sx={{ height: 40, mt: 0.4, width: 80 }}
								onClick={createPack}
								disabled={createLoading}
							>
								<AddIcon />
							</Button>
						</Box>
					</Box>
				),
			}}
		>
			Nova Embalagem
		</ModalButton>
	);
};