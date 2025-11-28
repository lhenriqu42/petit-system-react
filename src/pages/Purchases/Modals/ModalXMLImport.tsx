import {
	Box,
	Button,
	TableRow,
	TableCell,
	Typography,
} from "@mui/material";
import { nToBRL } from "../../../shared/services/formatters";
import { ListArray } from "../../../shared/components/ListArray";
import { useEffect, useState } from "react";
import { CustomTextField } from "../../../shared/forms/customInputs/CustomTextField";
import { IProduct, PackService, ProductService } from "../../../shared/services/api";
import { CustomAutoComplete } from "../../../shared/forms/customInputs/CustomAutoComplete";
import { styled } from '@mui/material/styles';
import Swal from "sweetalert2";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ModalButton } from "../../../shared/components/ModalButton";
import { useDeepEffect } from "../../../shared/hooks";
import InventoryIcon from '@mui/icons-material/Inventory';
import { useAssignModalProps } from "../../packs/RelateModal";

const VisuallyHiddenInput = styled('input')({
	clip: 'rect(0 0 0 0)',
	clipPath: 'inset(50%)',
	height: 1,
	overflow: 'hidden',
	position: 'absolute',
	bottom: 0,
	left: 0,
	whiteSpace: 'nowrap',
	width: 1,
});

interface ProductXML {
	id: string;        // Por Fornecedor
	code?: string;
	type: 'UN' | 'CX' | 'KG' | 'LT' | 'DP' | 'PC' | 'MT';
	name: string;
	quantity: number;
	unit_price: number;
	total_price: number;
	trib: {
		code?: string;
		type: 'UN' | 'CX' | 'KG' | 'LT' | 'DP' | 'PC' | 'MT';
		quantity: number;
		unit_price: number;
	}
	assign?: IProduct;
}

export const ModalXMLImport: React.FC = () => {
	const [emitter, setEmitter] = useState<string>('');
	const [products, setProducts] = useState<ProductXML[]>([]);
	const [allProducts, setAllProducts] = useState<{ id: number, label: string }[]>([]);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		ProductService.getAll(1, 999999999).then((result) => {
			if (result instanceof Error) {
				return Swal.fire({
					title: 'Erro ao carregar produtos',
					text: result.message,
					icon: 'error'
				});
			}
			setAllProducts(result.data.map(product => ({ id: product.id, label: product.name })));
			setLoading(false);
		});
	}, []);

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			file.text().then((text) => {
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(text, "application/xml");
				if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
					alert("XML inválido");
					return;
				}
				const emit = xmlDoc.querySelector("emit > xNome")?.textContent;
				if (!emit) {
					alert("Arquivo XML inválido: Emitente não encontrado");
					setEmitter('');
					setProducts([]);
					return;
				}
				const prods = xmlDoc.getElementsByTagName("prod");
				const products: ProductXML[] = [];
				for (let i = 0; i < prods.length; i++) {
					const prod = prods[i];

					const supp_prod_id = prod.querySelector("cProd")?.textContent;


					const name = prod.querySelector("xProd")?.textContent ?? "";

					const code_field = prod.querySelector("cEAN")?.textContent ?? undefined;
					const code = code_field === "SEM GTIN" ? undefined : code_field;
					const type = (prod.querySelector("uCom")?.textContent ?? "UN");
					const quantity = parseInt(prod.querySelector("qCom")?.textContent ?? "0");
					const unit_price = parseFloat(prod.querySelector("vUnCom")?.textContent ?? "0");

					const trib_code_field = prod.querySelector("cEANTrib")?.textContent ?? undefined;
					const trib_code = trib_code_field === "SEM GTIN" ? undefined : trib_code_field;
					const trib_type = (prod.querySelector("uTrib")?.textContent ?? "UN");
					const trib_quantity = parseInt(prod.querySelector("qTrib")?.textContent ?? "0");
					const trib_unit_price = parseFloat(prod.querySelector("vUnTrib")?.textContent ?? "0");

					const total_price = parseFloat(prod.querySelector("vProd")?.textContent ?? "0");

					if (!supp_prod_id) {
						alert('Produto sem código de fornecedor (cProd), importação cancelada: ' + name);
						continue;
					}
					products.push({
						id: supp_prod_id,
						code,
						type: type as ProductXML['type'],
						name,
						quantity,
						unit_price,
						total_price,
						trib: {
							code: trib_code,
							type: trib_type as ProductXML['type'],
							quantity: trib_quantity,
							unit_price: trib_unit_price,
						}
					});
				}
				setEmitter(emit ?? '');
				setProducts(products);
			});
		}
	};
	const XMLPartColor = {
		header: { text: '#000', bg: '#f7f746ff', lines: '#e0d50099' },
		row: { text: '#000', bg: '#faface', lines: '#e0d50099' }
	};

	const PetitPartColor = {
		header: { text: '#FFFFFF', bg: '#004C99', lines: '#003366' },
		row: { text: '#000', bg: '#D0E4FB', lines: '#A0C4FF' }
	};

	return (
		<Box>
			<Box border={1} borderColor={'#ccc'} borderRadius={2} p={1} display={'flex'} mb={1} justifyContent={'center'} gap={2}>
				<Button
					component="label"
					role={undefined}
					variant="contained"
					tabIndex={-1}
					startIcon={<CloudUploadIcon />}
				>
					Importar XML
					<VisuallyHiddenInput
						type="file"
						onChange={(event) => handleFileUpload(event)}
						accept=".xml"

					/>
				</Button>
			</Box>
			<Box border={2} p={1} borderColor={'#ccc'} borderRadius={2} gap={1} display={'flex'} flexDirection={'column'} height={670} alignItems={'center'}>
				<Box>
					<Typography variant="h6" color={emitter ? 'success' : 'error'}>{emitter || 'Nenhum arquivo importado'}</Typography>
				</Box>
				<Box border={1} borderColor={'#77f'} borderRadius={2} height={'100%'} pb={1} sx={{ backgroundColor: '#fafafe' }} width={'100%'}>

					{products.length > 0 ? (
						<ListArray
							items={products}
							itemsPerPage={8}
							CustomTableRowHeader={() => (
								<TableRow>
									<TableCell
										sx={{
											borderRadius: '7px 0 0 0',
											backgroundColor: XMLPartColor.header.bg,
											color: XMLPartColor.header.text,
											borderBottomColor: XMLPartColor.header.lines
										}}>
										Produto
									</TableCell>

									<TableCell
										sx={{
											backgroundColor: XMLPartColor.header.bg,
											color: XMLPartColor.header.text,
											borderBottomColor: XMLPartColor.header.lines
										}}>
										Quantidade
									</TableCell>

									<TableCell
										sx={{
											backgroundColor: XMLPartColor.header.bg,
											color: XMLPartColor.header.text,
											borderBottomColor: XMLPartColor.header.lines
										}}>
										Preço Unitário
									</TableCell>

									<TableCell
										sx={{
											backgroundColor: XMLPartColor.header.bg,
											color: XMLPartColor.header.text,
											borderBottomColor: XMLPartColor.header.lines
										}}>
										Preço Total
									</TableCell>

									{/* ---------------------------------------------------------------------------------------- */}

									<TableCell
										sx={{
											borderRadius: '0 7px 0 0',
											backgroundColor: PetitPartColor.header.bg,
											color: PetitPartColor.header.text,
											borderBottomColor: PetitPartColor.header.lines,
											textAlign: 'center'
										}}
										width={330}
									>
										Produto Petit
									</TableCell>

								</TableRow>
							)}
							CustomTableRow={({ row }) => {
								return (
									<TableRow key={row.id}>
										<TableCell
											sx={{
												backgroundColor: XMLPartColor.row.bg,
												color: XMLPartColor.row.text,
												borderBottomColor: XMLPartColor.row.lines
											}}>
											{row.name}
										</TableCell>

										<TableCell
											sx={{
												backgroundColor: XMLPartColor.row.bg,
												color: XMLPartColor.row.text,
												borderBottomColor: XMLPartColor.row.lines
											}}>{row.quantity}
										</TableCell>

										<TableCell
											sx={{
												backgroundColor: XMLPartColor.row.bg,
												color: XMLPartColor.row.text,
												borderBottomColor: XMLPartColor.row.lines
											}}>
											{nToBRL(row.unit_price)}
										</TableCell>

										<TableCell
											sx={{
												backgroundColor: XMLPartColor.row.bg,
												color: XMLPartColor.row.text,
												borderBottomColor: XMLPartColor.row.lines
											}}>
											{nToBRL(row.total_price)}
										</TableCell>

										{/* ---------------------------------------------------------------------------------------- */}


										<TableCell
											sx={{
												backgroundColor: PetitPartColor.row.bg,
												color: PetitPartColor.row.text,
												borderBottomColor: PetitPartColor.row.lines,
												textAlign: 'center'
											}}
										>
											{
												loading ? (
													<Typography variant="body2" color="textSecondary">Carregando...</Typography>
												) : (
													<ModalButton
														size="small"
														modalProps={{
															title: 'Relacionar Produto',
															maxWidth: 'md',
															ModalContent:
																<ModalRelacionarProduto
																	row={row}
																	allProducts={allProducts}
																/>
														}}
													>
														Relacionar
													</ModalButton>
												)
											}
										</TableCell>
									</TableRow>
								)
							}}
						/>
					) : (
						<Box height={'100%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
							<Typography variant="body1" color="textSecondary">Nenhum produto importado</Typography>
						</Box>
					)}
				</Box>
			</Box >
		</Box >
	);
};










interface IModalRelacionarProdutoProps {
	row: ProductXML;
	allProducts: { id: number; label: string }[];
}


export function ModalRelacionarProduto({ row, allProducts }: IModalRelacionarProdutoProps) {
	const [selectedProd, setSelectedProd] = useState({ id: -1, label: "" });
	const [packs, setPacks] = useState<{ id: number; label: string }[]>([{ id: 0, label: 'Unitário' }]);
	const [reloadKey, setReloadKey] = useState(0);
	const [loading, setLoading] = useState(true);
	useDeepEffect(() => {
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
	return (
		<Box p={2}>
			<CustomTextField label="Produto Fornecedor" value={row.name} disabled />

			<Box mt={2} display="flex" gap={2} height={80}>
				<CustomAutoComplete
					label="Produto Petit"
					fullWidth
					options={allProducts}
					callback={setSelectedProd}
				/>
				{
					<Box display={'flex'} gap={2} width="100%">
						<Box width="100%">
							<CustomAutoComplete
								disabled={selectedProd.id === -1 || loading}
								label="Pacote Petit"
								fullWidth
								options={packs}
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