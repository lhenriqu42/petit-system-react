import {
	Box,
	Button,
	TableRow,
	TableCell,
	Typography,
} from "@mui/material";
import Swal from "sweetalert2";
import { useRef, useState } from "react";
import { styled } from '@mui/material/styles';
import SyncIcon from '@mui/icons-material/Sync';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { nToBRL } from "../../../../shared/services/formatters";
import { ModalFab } from "../../../../shared/components/ModalFab";
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import { ListArray } from "../../../../shared/components/ListArray";
import { submitFormEvent } from "../../../../shared/events/formEvents";
import { ModalButton } from "../../../../shared/components/ModalButton";
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { IGetMapResponse, INFEmitter, INFEmitterResponse, SupProdMapService } from "../../../../shared/services/api";
import { ModalRelacionarEmissor } from "./ModalRelacionarEmissor";
import { ModalRelacionarProduto } from "./ModalRelacionarProduto";
import { Modal } from "../../../../shared/components";
import { LinearProgressWithLabel } from "../../../../shared/components/LinearProgress";
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

export interface ProductXML {
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
	assign?: {
		prod_id: number;
		prod_name: string;
		pack_id: number | null;
		pack_qtt: number | null;
	};
}


export const ModalXMLImport: React.FC = () => {
	const [loading, setLoading] = useState(true);
	const [emitter, setEmitter] = useState<INFEmitterResponse>();
	const [emitterName, setEmitterName] = useState<string>('');
	const [products, setProducts] = useState<ProductXML[]>([]);
	const get_emitter = (xmlDoc: Document): INFEmitter | null => {
		const emitNode = xmlDoc.querySelector("emit");
		if (!emitNode) return null;

		const cnpj = emitNode.querySelector("CNPJ")?.textContent;
		if (!cnpj) return null;
		const x_nome = emitNode.querySelector("xNome")?.textContent;
		if (!x_nome) return null;
		const x_fant = emitNode.querySelector("xFant")?.textContent;
		if (!x_fant) return null;

		const ie = emitNode.querySelector("IE")?.textContent ?? undefined;

		const enderEmit = emitNode.querySelector("enderEmit");
		const cep = enderEmit?.querySelector("CEP")?.textContent ?? undefined;
		const uf = enderEmit?.querySelector("UF")?.textContent ?? undefined;
		const city = enderEmit?.querySelector("xMun")?.textContent ?? undefined;
		const district = enderEmit?.querySelector("xBairro")?.textContent ?? undefined;
		const street = enderEmit?.querySelector("xLgr")?.textContent ?? undefined;
		const number = enderEmit?.querySelector("nro")?.textContent ?? undefined;
		const complemento = enderEmit?.querySelector("complemento")?.textContent ?? undefined;
		return {
			cnpj,
			x_nome,
			x_fant,
			ie,
			cep,
			uf,
			city,
			district,
			street,
			number,
			complemento,
		}
	}
	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			setLoading(true);
			file.text().then((text) => {
				const parser = new DOMParser();
				const xmlDoc = parser.parseFromString(text, "application/xml");
				if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
					alert("XML inválido");
					return;
				}
				const emit: INFEmitter | null = get_emitter(xmlDoc);
				if (!emit) {
					Swal.fire({
						title: 'Arquivo XML inválido!',
						text: "Informações do emissor não encontradas.",
						icon: "error"
					});
					setEmitter(undefined);
					setEmitterName('');
					setProducts([]);
					if (fileInputRef.current) fileInputRef.current.value = '';
					return;
				}
				setEmitterName(emit.x_nome);
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
				handleSync(products, emit)
					.then(() => {setLoading(false)})
					.catch((error) => {
						alert('Erro ao sincronizar dados: ' + error);
						setLoading(false);
					})
					.finally(() => { setProgress(0); });
			});
		}
	};
	const fileInputRef = useRef<HTMLInputElement>(null);


	async function syncProducts(XMLProducts: ProductXML[], emitter: INFEmitterResponse, totalToProcess: number) {
		const syncedProducts: ProductXML[] = [];
		for (const xmlProd of XMLProducts) {
			if (!emitter.supplier_id) return null;
			const prodMap = await SupProdMapService.getProdMap(emitter.supplier_id, xmlProd.id);
			if (prodMap) {
				xmlProd.assign = {
					pack_id: prodMap.pack_id,
					prod_id: prodMap.prod_id,
					prod_name: prodMap.prod_name,
					pack_qtt: prodMap.pack_qtt,
				};
			}
			syncedProducts.push(xmlProd);
			setProgress((prev) => prev + (1 / totalToProcess) * 100);
		}
		return syncedProducts;
	}


	async function syncEmitter(XMLEmitter: INFEmitter) {
		const dbemitter = await SupProdMapService.getNFEmitterByCNPJ(XMLEmitter.cnpj);
		if (dbemitter) return dbemitter;

		// Envia novo emissor no banco
		const created = await SupProdMapService.createNFEmitter(XMLEmitter);
		return created;
	}
	const [progress, setProgress] = useState(0);
	async function handleSync(products: ProductXML[], emitter: INFEmitter) {
		const totalToProcess = products.length + 1; // +1 para o emissor
		const emitSynced = await syncEmitter(emitter);
		setProgress((prev) => prev + (1 / totalToProcess) * 100);
		const productsSynced = await syncProducts(products, emitSynced, totalToProcess);
		setEmitter(emitSynced);
		if (productsSynced) setProducts(productsSynced);
	}

	return (
		<Box>
			<Box border={1} borderColor={'#ccc'} borderRadius={2} p={1} display={'flex'} flexDirection={'column'} mb={1} justifyContent={'center'} alignItems={'center'} gap={2} px={5}>
				<Box>
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
							ref={fileInputRef}
							onChange={(event) => handleFileUpload(event)}
							accept=".xml"
						/>
					</Button>
				</Box>
				{
					emitterName && loading &&
					<LinearProgressWithLabel
						value={progress}
					/>
				}
			</Box>
			<Box border={2} p={1} borderColor={'#ccc'} borderRadius={2} gap={1} display={'flex'} flexDirection={'column'} height={670} alignItems={'center'}>
				<Box display={'flex'} alignItems={'center'} gap={1}>
					<Typography variant="h6" color={emitterName ? 'success' : 'error'}>{emitterName || 'Nenhum arquivo importado'}</Typography>
					{
						emitterName &&
						(
							loading ?
								<SyncIcon
									sx={{
										animation: 'spin 1s linear infinite',
										'@keyframes spin': {
											from: { transform: 'rotate(0deg)' },
											to: { transform: 'rotate(-360deg)' }
										}
									}}
								/>
								:
								emitter &&
								<ModalFab
									color={emitter.supplier_id ? "warning" : "error"}
									size="small"
									modalProps={{
										title: 'Relacionar Emissor ao Fornecedor',
										maxWidth: 'sm',
										submitButtonProps: { Text: 'Confirmar' },
										submit: async () => {
											const [id] = submitFormEvent.emit({ formId: 'submitAssign' });
											const promisse = id as Promise<number>;
											promisse.then((res) => setEmitter((old) => old ? { ...old, supplier_id: res } : old));
										},
										id: 'relacionar-emissor',
										ModalContent:
											<ModalRelacionarEmissor
												modalId="relacionar-emissor"
												emissor={emitter}
											/>
									}}
								>
									{emitter.supplier_id ? <AssignmentTurnedInIcon /> : <AssignmentLateIcon />}
								</ModalFab >
						)
					}

				</Box>
				{(() => {
					const XMLPartColor = {
						header: { text: '#000', bg: '#f7f746ff', lines: '#e0d50099' },
						row: { text: '#000', bg: '#faface', lines: '#e0d50099' }
					};

					const PetitPartColor = {
						header: { text: '#FFFFFF', bg: '#004C99', lines: '#003366' },
						row: { text: '#000', bg: '#D0E4FB', lines: '#A0C4FF' }
					};

					function submitProdsAndUpdate(row_id: string) {
						const [res] = submitFormEvent.emit({ formId: 'submitAssignProd' });
						const promisse = res as Promise<IGetMapResponse | null>;
						promisse.then((res) => {
							if (!res) return;
							setProducts((old) => {
								return old.map((prod) => {
									if (prod.id === row_id) {
										return {
											...prod,
											assign: {

												prod_id: res.prod_id,
												prod_name: res.prod_name,
												pack_id: res.pack_id,
												pack_qtt: res.pack_qtt,
											}
										};
									}
									return prod;
								});
							})
						});
					}

					return (
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
										const [modalOpen, setModalOpen] = useState(false);
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

												<Modal
													onClose={() => { setModalOpen(false) }}
													open={modalOpen}
													id='relacionar-produto'
													title='Relacionar Produto'
													maxWidth='md'
													submit={async () => { submitProdsAndUpdate(row.id) }}
													ModalContent={
														row.assign && emitter?.supplier_id ? (
															<ModalRelacionarProduto
																modalId="relacionar-produto"
																supplier_id={emitter.supplier_id}
																row={row}
															/>
														) : null
													}
												/>
												<TableCell
													sx={{
														backgroundColor: PetitPartColor.row.bg,
														color: PetitPartColor.row.text,
														borderBottomColor: PetitPartColor.row.lines,
														textAlign: 'center',
														...(row.assign ? {
															cursor: 'pointer',
															'&:hover': {
																backgroundColor: '#b3d1ff'
															}
														} : {})
													}}
													onClick={() => {
														if (row.assign) {
															setModalOpen(true);
														}
													}}
												>
													{
														loading ?
															(
																<Typography variant="body2" color="textSecondary">Carregando...</Typography>
															)
															: !(emitter?.supplier_id) ?
																<Typography variant="body2" color="textSecondary">Atribua o Emissor do XML a um fornecedor</Typography>
																:
																row.assign ?
																	<Box
																		sx={{
																			display: 'flex',
																			gap: 1,
																			justifyContent: 'space-between',
																			alignItems: 'center',
																		}}
																	>
																		<Typography variant="body2"><strong>{row.assign.prod_name}</strong></Typography>
																		<Typography variant="body2"><strong>{row.assign.pack_qtt ? `${row.assign.pack_qtt} un` : '-'}</strong></Typography>
																	</Box>
																	:
																	(
																		<ModalButton
																			size="small"
																			modalProps={{
																				id: 'relacionar-produto',
																				title: 'Relacionar Produto',
																				maxWidth: 'md',
																				submit: async () => submitProdsAndUpdate(row.id),
																				ModalContent:
																					<ModalRelacionarProduto
																						modalId="relacionar-produto"
																						supplier_id={emitter.supplier_id}
																						row={row}
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
					)
				})()}
			</Box >
		</Box >
	);
};



