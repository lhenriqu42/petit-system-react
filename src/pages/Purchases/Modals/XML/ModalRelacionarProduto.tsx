
import {
	Box,
	Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { ProductXML } from "./ModalXMLImport";
import { useDeepEffect } from "../../../../shared/hooks";
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAssignModalProps } from "../../../packs/RelateModal";
import { submitFormEvent } from "../../../../shared/events/formEvents";
import { ModalButton } from "../../../../shared/components/ModalButton";
import { CustomTextField } from "../../../../shared/forms/customInputs/CustomTextField";
import { CustomAutoComplete } from "../../../../shared/forms/customInputs/CustomAutoComplete";
import { PackService, ProductService, SupProdMapService } from "../../../../shared/services/api";
import { modalCloseEvent } from "../../../../shared/events/modalEvents";



export function ModalRelacionarProduto({ modalId, supplier_id, row }: { modalId: string; supplier_id: number; row: ProductXML }) {
	const [allProducts, setAllProducts] = useState<{ id: number; label: string }[]>([]);
	const [loadingProd, setLoadingProd] = useState(true);
	useEffect(() => {
		setLoadingProd(true);
		ProductService.getAll(1, 999999999).then((result) => {
			if (result instanceof Error) {
				return Swal.fire({
					title: 'Erro ao carregar produtos',
					text: result.message,
					icon: 'error'
				});
			}
			setAllProducts(result.data.map(product => ({ id: product.id, label: product.name })));
			setLoadingProd(false);
		});
	}, []);
	const [selectedProd, setSelectedProd] = useState({ id: -1, label: "" });
	const [selectedPack, setSelectedPack] = useState<{ id: number; label: string }>({ id: 0, label: 'Unitário' });
	const [packs, setPacks] = useState<{ id: number; label: string }[]>([{ id: 0, label: 'Unitário' }]);
	const [reloadKey, setReloadKey] = useState(0);
	const [loading, setLoading] = useState(true);
	useDeepEffect(() => {
		console.log(row);
		setLoading(true);
		setPacks([{ id: 0, label: 'Unitário' }]);
		if (selectedProd.id === -1) return;
		PackService.getPacksByProd(1, 99999999, { prod_id: selectedProd.id }).then((result) => {
			if (result instanceof Error) {
				console.error(result);
				return Swal.fire({
					title: 'Erro ao carregar embalagens',
					text: result.message,
					icon: 'error'
				});
			}
			setPacks([{ id: 0, label: 'Unitário' }, ...result.data.map(pack => ({ id: pack.id, label: pack.description.slice(14) }))]);
			setLoading(false);
		});
	}, [selectedProd, reloadKey]);
	const assignModalProps = useAssignModalProps(
		{
			mode: 'pack',
			id: selectedProd.id,
			label: selectedProd.label
		},
		() => setReloadKey(r => r + 1) // success callback
	);

	const submitAssign = async () => {
		if (selectedProd.id === -1) {
			await Swal.fire({
				title: 'Erro',
				html: 'Selecione um <b>Produto Petit</b> antes de relacionar.',
				icon: 'error'
			});
			return null;
		}

		if (selectedPack.id === -1) {
			await Swal.fire({
				title: 'Erro',
				html: 'Selecione uma <b>Embalagem Petit</b> antes de relacionar.',
				icon: 'error'
			});
			return null;
		}
		try {
			const new_register = await SupProdMapService.createOrUpdate({
				supplier_id: supplier_id,
				prod_id: selectedProd.id,
				pack_id: selectedPack.id === 0 ? undefined : selectedPack.id,
				supplier_prod_id: row.id,
				supplier_prod_code: row.code || '',
				supplier_prod_name: row.name,
			})
			await Swal.fire({
				title: 'Sucesso',
				html: 'Produto relacionado com sucesso.',
				icon: 'success',
				willClose: () => {
					modalCloseEvent.emit({ modalId });
				}
			});
			return new_register;
		} catch (error) {
			await Swal.fire({
				title: 'Erro',
				html: 'Ocorreu um erro ao relacionar o produto.',
				icon: 'error'
			});
			return null;
		}
	};

	useEffect(() => {
		const unsubscribe = submitFormEvent.on(({ formId }) => formId === 'submitAssignProd' && submitAssign());
		return unsubscribe;
	}, [selectedProd, selectedPack]);

	useEffect(() => {
		setSelectedPack({ id: 0, label: 'Unitário' });
	}, [reloadKey]);

	return (
		<Box p={2}>
			<CustomTextField label="Produto Fornecedor" value={row.name} disabled />

			<Box mt={2} display="flex" gap={2} height={80}>
				<CustomAutoComplete
					defaultValue={row.assign?.prod_id}
					disabled={loadingProd}
					label={loadingProd ? "Carregando..." : "Produto Petit"}
					fullWidth
					options={allProducts}
					callback={(item) => {
						setSelectedProd(item);
						setSelectedPack({ id: 0, label: 'Unitário' });
					}}
				/>
				{
					<Box display={'flex'} gap={2} width="100%">
						<Box width="100%">
							<CustomAutoComplete
								defaultValue={row.assign?.pack_id ?? 0}
								disabled={selectedProd.id === -1 || loading}
								label="Embalagem Petit"
								fullWidth
								options={packs}
								callback={setSelectedPack}
							/>
							{(selectedProd.id !== -1 && loading) && <Typography variant="caption" color="textSecondary">Carregando embalagens...</Typography>}
						</Box>
						<ModalButton
							sx={{ maxHeight: 56 }}
							disabled={selectedProd.id === -1}
							fullWidth
							startIcon={<InventoryIcon />}
							size="small"
							modalProps={assignModalProps}
						>
							Relacionar Embalagens
						</ModalButton>
					</Box>
				}
			</Box>
		</Box>
	);
}
