import * as yup from 'yup';
import Swal from "sweetalert2";
import './../../shared/css/sweetAlert.css';
import AddIcon from '@mui/icons-material/Add';
import { LayoutMain } from "../../shared/layouts";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { EUserRole, IUser, UserService } from "../../shared/services/api/UserService";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, Fab, Icon, Pagination, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography, useTheme } from "@mui/material";
import { VForm } from "../../shared/forms/VForm";
import { FormHandles } from "@unform/core";
import { VTextField } from "../../shared/forms/VTextField";
import { IMenuItens, VSelect } from '../../shared/forms/VSelect';
import { Environment } from '../../shared/environment';

interface IFormDataValidated {
	name: string;
	email: string;
	password: string;
	role: EUserRole;
}

const selectManuItens: IMenuItens[] = [
	{ text: 'Administrador', value: 'admin' },
	{ text: 'Funcionário', value: 'employee' }
];

const formValidation: yup.Schema<IFormDataValidated> = yup.object().shape({
	name: yup.string().required().min(3).max(50),
	email: yup.string().required().email().min(5).max(50),
	password: yup.string().required().min(6),
	role: yup.mixed<EUserRole>().required().oneOf(Object.values(EUserRole)),
});

export const Users: React.FC = () => {
	const theme = useTheme();

	const formRef = useRef<FormHandles>(null);

	const [totalCount, setTotalCount] = useState(0);
	const [password, setPassword] = useState("");
	const [passwordError, setPasswordError] = useState(false);
	const [rows, setRows] = useState<IUser[]>([]);
	const [loading, setLoading] = useState(true);

	const [searchParams, setSearchParams] = useSearchParams();

	const page = useMemo(() => {
		return searchParams.get('page') || 1;
	}, [searchParams]);

	useEffect(() => {
		setLoading(true);
		listUsers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page]);

	//ADD MODAL
	const [open, setOpen] = useState(false);
	const handleOpen = () => {
		setOpen(true);
	};
	const handleClose = () => {
		setOpen(false);
	};

	const listUsers = async () => {
		try {

			const result = await UserService.getAll(Number(page));

			if (result instanceof Error) {
				alert(result.message);
			} else {
				setRows(result.data);
				setTotalCount(result.totalCount);
			}

		} catch (e) {
			console.error(e);
		} finally {
			setLoading(false);
		}
	}

	const handleSubmit = async (data: { name: string, email: string, password: string }) => {
		try {
			const new_data = await formValidation.validate(data, { abortEarly: false });
			if (password !== data.password)
				return setPasswordError(true);
			const response = await UserService.create(new_data);
			if (response instanceof Error) {
				console.log(response);
			} else {
				Swal.fire({
					icon: "success",
					title: "Produto cadastrado com sucesso!",
					showConfirmButton: false,
					timer: 1000,
					didClose() {
						formRef.current?.setFieldValue('name', '');
						formRef.current?.setFieldValue('password', '');
						setPassword('');
						formRef.current?.setFieldValue('email', '');
						formRef.current?.setFieldValue('role', '');
					},
				});
				listUsers();
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
		}
	}

	const handleDelete = (id: number, name: string) => {
		Swal.fire({
			title: 'Tem Certeza?',
			text: `Apagar "${name}" ?`,
			icon: 'warning',
			iconColor: theme.palette.error.main,
			showCancelButton: true,
			confirmButtonColor: theme.palette.error.main,
			cancelButtonColor: '#aaa',
			cancelButtonText: 'Cancelar',
			confirmButtonText: 'Deletar'
		}).then((result) => {
			if (result.isConfirmed) {
				UserService.deleteById(id).then((result) => {
					if (result instanceof Error) {
						alert(result.message);
					} else {
						Swal.fire({
							title: 'Deletado!',
							text: 'Usuário apagado.',
							icon: 'success',
						});
						listUsers();
					}
				});

			}
		});
	};

	return (
		<LayoutMain title="Usuários" subTitle='Cadastre ou delete usuários'>
			<Paper sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1 }} variant="elevation">
				<Box display={'flex'} justifyContent={'space-between'}>
					<Link to={'/usuarios'}>
						<Button
							variant="contained"
							onClick={handleOpen}
						>
							<AddIcon sx={{ mr: 1 }} /> Novo Usuário
						</Button>
					</Link>
				</Box>
			</Paper>
			<Paper variant="elevation" sx={{ backgroundColor: '#fff', mr: 4, px: 3, py: 1, mt: 1, width: 'auto', minHeight: 600 }}>
				<Box minHeight={550}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>Nome</TableCell>
								<TableCell>Email</TableCell>
								<TableCell>Cargo</TableCell>
								<TableCell>Ações</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{
								rows.map((row) => (
									<TableRow hover key={row.id}>
										<TableCell><Typography>{row.name}</Typography></TableCell>
										<TableCell><Typography>{row.email}</Typography></TableCell>
										<TableCell><Typography>{row.role}</Typography></TableCell>
										<TableCell>
											<Fab size="medium" color="error" onClick={() => handleDelete(row.id, row.name)}>
												<Icon>delete</Icon>
											</Fab>
										</TableCell>
									</TableRow>
								))
							}
						</TableBody>
					</Table>
				</Box>
				<Pagination
					sx={{ m: 1 }}
					disabled={loading}
					page={Number(page)}
					count={Math.ceil(totalCount / Environment.LIMITE_DE_LINHAS)}
					onChange={(_, newPage) => { setSearchParams({ page: newPage.toString() }, { replace: true }); }}
					siblingCount={1}
				/>
			</Paper>

			{/* ADD MODAL */}
			<Dialog
				open={open}
				onClose={handleClose}
				fullWidth
				sx={{
					"& .MuiDialog-paper": { backgroundColor: "#fff" },
				}}
			>
				<DialogTitle>Cadastrar Usuário:</DialogTitle>
				<DialogContent>
					<Box p={1} mb={2}>
						<DialogContentText mb={2}>
							Dados do usuário:
						</DialogContentText>
						<VForm
							onSubmit={handleSubmit}
							placeholder={''}
							ref={formRef}
						>
							<Box display={'flex'} flexDirection={'column'} gap={1}>
								<VTextField
									name="name"
									size="small"
									label="Nome"
									autoComplete="off"
									fullWidth
								/>
								<VTextField
									name="email"
									size="small"
									label="Email"
									autoComplete="off"
									fullWidth
								/>
								<Divider sx={{ backgroundColor: "rgb(255,255,255,0.2)", my: 1 }} />
								<VTextField
									name="password"
									size="small"
									label="Senha"
									autoComplete="off"
									type="password"
									fullWidth
								/>
								<TextField
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									size="small"
									label="Confirmar Senha"
									autoComplete="off"
									type="password"
									fullWidth
								/>
								{passwordError && <Typography color="error" variant="caption">As senhas não coincidem.</Typography>}
								<Divider sx={{ backgroundColor: "rgb(255,255,255,0.2)", my: 1 }} />
								<VSelect name='role' label='Cargo' menuItens={selectManuItens} messageError='Cargo não pode ser vazio' />
							</Box>
						</VForm>
					</Box>
					<Button fullWidth variant="contained" onClick={() => formRef.current?.submitForm()}>Cadastrar</Button>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleClose}>Cancelar</Button>
				</DialogActions>
			</Dialog>
		</LayoutMain>
	);
};