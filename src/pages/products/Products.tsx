import {
	Box,
	Fab,
	Icon,
	Alert,
	Paper,
	Button,
	TableRow,
	TextField,
	TableCell,
	Typography,
	CircularProgress,
} from '@mui/material';
import * as yup from 'yup';
import Swal from 'sweetalert2'
import './../../shared/css/sweetAlert.css'
import { FormHandles } from '@unform/core';
import AddIcon from '@mui/icons-material/Add';
import { VForm } from '../../shared/forms/VForm';
import CheckIcon from '@mui/icons-material/Check';
import { LayoutMain } from '../../shared/layouts';
import { Link, useSearchParams } from 'react-router-dom';
import { VTextField } from '../../shared/forms/VTextField';
import { useEffect, useMemo, useRef, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { VSelect, IMenuItens } from '../../shared/forms/VSelect';
import { AuthService, ProductService } from '../../shared/services/api';
import { nToBRL } from '../../shared/services/formatters';
import { PROFIT_TARGET_MARGIN } from '../Purchases/Modals/ModalView';
import { ListItems } from '../../shared/components';
import { listReloadEvent } from '../../shared/events/listEvents';
import { LoadingWrapper } from '../../shared/utils/LoadingWrapper';

const selectManuItens: IMenuItens[] = [
	{ text: '1 - Bebidas', value: '1' },
	{ text: '2 - Chocolates', value: '2' },
	{ text: '3 - Salgadinhos', value: '3' },
	{ text: '4 - Sorvetes', value: '4' }
];

interface IFormDataValidated {
	id: number;
	name: string;
	sector: number;
	price: number;
}

interface IFormData {
	id: string;
	name: string;
	sector: number;
	price: string;
}


const formValidation: yup.Schema<IFormDataValidated> = yup.object().shape({
	id: yup.number().required().integer(),
	name: yup.string().required().min(3).max(50),
	sector: yup.number().required().min(1).max(4),
	price: yup.number().required().min(0),
});


export const Products: React.FC = () => {

	const [searchParams, setSearchParams] = useSearchParams();
	const search = useMemo(() => {
		return searchParams.get('search') || ''
	}, [searchParams]);

	const [copied, setCopied] = useState('');
	const [isEdit, setIsEdit] = useState(0);
	const [querryError, setQuerryError] = useState(false);

	const [editLoading, setEditLoading] = useState(false);
	const formRef = useRef<FormHandles>(null);

	const handleDelete = (id: number, name: string) => {
		Swal.fire({
			title: 'Tem Certeza?',
			text: `Apagar "${name}" ?`,
			icon: 'warning',
			showCancelButton: true,
			cancelButtonColor: '#aaa',
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Deletar'
		}).then((result) => {
			if (result.isConfirmed) {
				new LoadingWrapper(() => ProductService.deleteById(id))
					.onSuccess(() => listReloadEvent.emit('product-list'), 'Produto deletado com sucesso!')
					.onError(null, 'Erro ao deletar o produto.')
					.fire('Deletando produto...');
			}
		});
	};

	const handleEditMode = (id: number) => {
		setIsEdit(id)
	}

	const handleSubmit = async (data: IFormData) => {
		setEditLoading(true);
		try {
			const getNumbers = data.price.replace(/[^\d,.-]/g, '');
			data.price = getNumbers.replace('.', '').replace(',', '.');
			const dataValidated = await formValidation.validate(data, { abortEarly: false })
			const result = ProductService.updateById(Number(data.id), dataValidated);
			await new LoadingWrapper(() => Promise.resolve(result)).fire('Editando produto...');


			if (result instanceof Error) {
				setQuerryError(true);
			} else {
				setQuerryError(false);
				setIsEdit(0);
				listReloadEvent.emit('product-list');
				Swal.fire({
					icon: "success",
					title: "Produto editado com sucesso!",
					showConfirmButton: false,
					timer: 1500
				});
			}
		} catch (errors) {
			if (errors instanceof yup.ValidationError) {
				const validatenErrors: { [key: string]: string } = {};
				errors.inner.forEach((e) => {
					if (!e.path) return;
					validatenErrors[e.path] = e.message;
				});

				formRef.current?.setErrors(validatenErrors)
				return;
			}
			setQuerryError(true);
		} finally {
			setEditLoading(false);
		}
	}

	const [role, setRole] = useState('');
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		setLoading(true);
		AuthService.getRole().then(setRole).finally(() => {
			setLoading(false);
		});
	}, [])

	return (
		<LayoutMain title="Produtos" subTitle='Cadastre, edite e remova produtos'>
			<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
				<Box display={'flex'} justifyContent={'space-between'}>
					<TextField
						size="small"
						placeholder={'Pesquisar'}
						value={search}
						onChange={(event) => { setSearchParams({ search: event.target.value }, { replace: true }) }}
						autoComplete="off"
					/>
					<Link to={'/produtos/novo'}>
						<Button variant="contained"><AddIcon sx={{ mr: 1 }} />Novo Produto</Button>
					</Link>
				</Box>
			</Paper>
			<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto', minHeight: 600 }}>
				{(querryError && <Alert severity="error">Já existe um produto com este código !</Alert>)}
				<VForm
					onSubmit={handleSubmit}
					placeholder={''}
					ref={formRef}
				>
					{loading ?
						<Box display={'flex'} justifyContent={'center'} alignItems={'center'} height={680} width={'100%'}>
							<CircularProgress size={100} />
						</Box>
						:
						<Box height={680} width={'100%'}>
							<ListItems
								id='product-list'
								filters={{ orderByStock: false, search: search }}
								height={673}
								apiCall={ProductService.getAll}
								CustomTableRowHeader={
									() => (
										<TableRow>
											<TableCell width={160}>Código</TableCell>
											<TableCell width={406}>Nome</TableCell>
											<TableCell width={305}>Setor</TableCell>
											<TableCell width={200}>Preço</TableCell>
											<TableCell width={232}>Ações</TableCell>
											{
												role === 'admin' &&
												<>
													<TableCell width={160}>Custo Médio</TableCell>
													<TableCell width={160}>Custo Atual</TableCell>
													<TableCell width={160}>Margem de Lucro</TableCell>
												</>
											}
										</TableRow>
									)
								}
								CustomTableRow={
									({ row }) => (
										isEdit !== row.id ?
											<TableRow key={row.id} hover>
												<TableCell
													onMouseDown={() => { navigator.clipboard.writeText(row.code); setCopied(row.code); }}
													onMouseLeave={() => setCopied('')}
													sx={copied != row.code ? {
														cursor: 'pointer'
													} : {
														cursor: 'default'
													}}
												>
													<Box
														display={'flex'}
														alignItems={'center'}
														gap={2}
													>
														{row.code}
														<Box>
															{
																copied == row.code ?
																	<CheckIcon fontSize='small' />
																	:
																	<ContentCopyIcon fontSize='small' />
															}
														</Box>
													</Box>
												</TableCell>
												<TableCell>{row.name}</TableCell>
												<TableCell>{
													row.sector === 1 ? '1 - Bebidas' :
														row.sector === 2 ? '2 - Chocolates' :
															row.sector === 3 ? '3 - Salgadinhos' :
																row.sector === 4 ? '4 - Sorvetes' :
																	`${row.sector} - Desconhecido`
												}
												</TableCell>
												<TableCell>{nToBRL(row.price)}</TableCell>
												<TableCell>
													{(!isEdit &&
														<Fab size="medium" color="error" aria-label="add" sx={{ mr: 2 }} onClick={() => handleDelete(row.id, row.name)}>
															<Icon>delete</Icon>
														</Fab>
													)}
													<Fab size="medium" color="warning" aria-label="add" onClick={() => handleEditMode(row.id)}>
														<Icon>edit</Icon>
													</Fab>
												</TableCell>
												{
													role === 'admin' &&
													<>
														<TableCell>{row.avg_cost ? nToBRL(row.avg_cost) : 'N/A'}</TableCell>
														<TableCell>{row.last_unit_cost ? nToBRL(row.last_unit_cost) : 'N/A'}</TableCell>
														{(() => {
															const margin = row.last_unit_cost ? (((row.price - row.last_unit_cost) / row.price) * 100) : null;
															return (
																<TableCell>
																	<Typography color={margin !== null ? (margin >= PROFIT_TARGET_MARGIN ? 'success' : 'error') : 'textPrimary'}>
																		{margin === null ? 'N/A' : `${margin.toFixed(2)}%`}
																	</Typography>
																</TableCell>
															)
														})()}
													</>
												}
											</TableRow >
											:
											<TableRow key={row.id} hover>
												<TableCell>
													{row.code}
												</TableCell>
												<TableCell>
													<Box maxWidth={330}>
														<VTextField name='id' valueDefault={`${row.id}`} sx={{ display: 'none' }} />
														<VTextField name='name' label={'Nome'} autoComplete="off" valueDefault={row.name} />
													</Box>
												</TableCell>
												<TableCell>
													<VSelect name='sector' label='Setor' menuItens={selectManuItens} defaultSelected={row.sector} messageError='Setor não pode ser vazio' />
												</TableCell>
												<TableCell>
													<Box width={180}>
														<VTextField
															name='price'
															label={'Preço'}
															autoComplete="off"
															valueDefault={nToBRL(row.price)}
															cash
														/>
													</Box>
												</TableCell>
												<TableCell>
													<Fab size="medium" color="error" aria-label="add" sx={{ mr: 2 }} onClick={() => setIsEdit(0)}>
														<Icon>close</Icon>
													</Fab>
													<Fab size="medium" color="success" aria-label="add" onClick={() => formRef.current?.submitForm()} disabled={editLoading}>
														<Icon>check</Icon>
													</Fab>
												</TableCell>
												{
													role === 'admin' &&
													<>
														<TableCell>{row.avg_cost ? nToBRL(row.avg_cost) : 'N/A'}</TableCell>
														<TableCell>{row.last_unit_cost ? nToBRL(row.last_unit_cost) : 'N/A'}</TableCell>
														{(() => {
															const margin = row.last_unit_cost ? (((row.price - row.last_unit_cost) / row.price) * 100) : null;
															return (
																<TableCell>
																	<Typography color={margin !== null ? (margin >= PROFIT_TARGET_MARGIN ? 'success' : 'error') : 'textPrimary'}>
																		{margin === null ? 'N/A' : `${margin.toFixed(2)}%`}
																	</Typography>
																</TableCell>
															)
														})()}
													</>
												}

											</TableRow >
									)
								}
							/>
						</Box>
					}
				</VForm>
			</Paper>
		</LayoutMain >
	);
};