
import {
	Box,
	Typography,
} from "@mui/material";
import { CustomAutoComplete } from "../../../../shared/forms/customInputs/CustomAutoComplete";
import { useEffect, useState } from "react";
import { INFEmitterResponse, SupplierService, SupProdMapService } from "../../../../shared/services/api";
import { submitFormEvent } from "../../../../shared/events/formEvents";
import Swal from "sweetalert2";
import { modalCloseEvent } from "../../../../shared/events/modalEvents";


export function ModalRelacionarEmissor({ modalId, emissor }: { modalId: string, emissor: INFEmitterResponse }) {
	const [loadingSup, setLoadingSup] = useState(true);
	const [suppliers, setSuppliers] = useState<{ id: number, label: string }[]>([]);
	const [supSelected, setSupSelected] = useState<{ id: number, label: string }>({ id: -1, label: '' });
	useEffect(() => {
		const fetchSuppliers = async () => {
			const suppliers = await SupplierService.getAll(1, '', 99999999);
			if (suppliers instanceof Error) return alert(suppliers.message);
			setSuppliers(suppliers.data.map(sup => ({ id: sup.id, label: sup.name })));
		};
		setLoadingSup(true);
		fetchSuppliers().then(() => setLoadingSup(false));
	}, []);

	const submitAssign = async () => {
		if (supSelected.id === -1) {
			await Swal.fire({
				title: 'Erro',
				text: 'Selecione um fornecedor para relacionar ao emissor.',
				icon: 'error'
			});
			return null;
		}

		try {
			await SupProdMapService.linkNFEmitterToSupplier(emissor.id, supSelected.id)
			await Swal.fire({
				title: 'Sucesso',
				text: 'Emissor relacionado ao fornecedor com sucesso.',
				icon: 'success',
				willClose: () => {
					modalCloseEvent.emit({ modalId });
				}
			});
			return supSelected.id;
		} catch (error) {
			await Swal.fire({
				title: 'Erro',
				text: 'Ocorreu um erro ao relacionar o emissor ao fornecedor.',
				icon: 'error'
			});
			return null;
		}

	}

	useEffect(() => {
		const unsubscribe = submitFormEvent.on(({ formId }) => formId === 'submitAssign' && submitAssign());
		return unsubscribe;
	}, [supSelected]);

	return (
		<Box p={2} border={1} borderColor="grey.400" borderRadius={2} display="flex" flexDirection="column" gap={2}>
			<Box>
				<Typography variant="h6" fontSize={17}>Informações do Emissor</Typography>
				<Box mt={1} display="flex" flexDirection="column" gap={0.4}>
					<Typography variant="body2"><strong>Nome:</strong> {emissor.x_nome}</Typography>
					<Typography variant="body2"><strong>Fantasia:</strong> {emissor.x_fant}</Typography>
					<Typography variant="body2"><strong>CNPJ:</strong> {emissor.cnpj}</Typography>
					<Typography variant="body2"><strong>Inscrição Estadual:</strong> {emissor.ie}</Typography>
					<Typography variant="body2"><strong>Endereço:</strong> {emissor.address_str}</Typography>
				</Box>
			</Box>
			<Box mt={2} display="flex" gap={2} height={80}>
				<CustomAutoComplete
					defaultValue={emissor.supplier_id}
					disabled={loadingSup}
					label={loadingSup ? "Carregando Fornecedores..." : "Fornecedor Relacionado"}
					fullWidth
					options={suppliers}
					callback={setSupSelected}
				/>
			</Box>
		</Box>
	);
}
