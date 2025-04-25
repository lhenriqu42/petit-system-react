import { Alert, Avatar, Box, Button, Card, CardActions, CardContent, CircularProgress, TextField, Typography } from "@mui/material";
import { useAuthContext } from "../../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from './../sidebar/img/Petit-logo.png';
import * as yup from 'yup';

const loginSchema = yup.object().shape({
	email: yup.string().required().email().min(5).max(50),
	password: yup.string().required().min(6),
});

interface ILoginProps {
	children: React.ReactNode;

}

export const Login: React.FC<ILoginProps> = ({ children }) => {

	const passwordInputRef = useRef<HTMLInputElement>(null)
	const [email, setEmail] = useState('');
	const [isLoaded, setIsLoaded] = useState(false);
	const [password, setPassword] = useState('');
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');
	const [loading, setLoading] = useState(false);
	const [networkError, setNetworkError] = useState(false);
	const { isAuthenticated, login } = useAuthContext();
	useEffect(() => {
		setIsLoaded(true);
	}, [isAuthenticated]);


	const handleSubmit = async () => {
		setLoading(true);
		setEmailError('');
		setPasswordError('');
		setNetworkError(false);

		try {
			const data = await loginSchema.validate({ email, password }, { abortEarly: false });
			const result = await login(data.email, data.password);
			if (result == 'Request failed with status code 401') {
				setEmailError('Email ou Senha Inválidos');
				setPasswordError('Email ou Senha Inválidos');
			}
			if (result == 'Sem conexão.') {
				setNetworkError(true);
			}
		} catch (errors) {
			if (errors instanceof yup.ValidationError) {
				errors.inner.forEach((e) => {
					if (e.path === 'email') {
						setEmailError(e.message);
					} else if (e.path === 'password') {
						setPasswordError(e.message);
					}
				});
			}
		} finally {
			setLoading(false);
		}
	};


	const handleKeyDownEmail = (e: React.KeyboardEvent<HTMLDivElement>) => {
		setEmailError('');
		if (e.code === 'Enter' || e.key === 'Enter') {

			passwordInputRef.current?.focus();
		}

	}

	const handleKeyDownPassword = (e: React.KeyboardEvent<HTMLDivElement>) => {
		setPasswordError('');
		if ((e.code === 'Enter' || e.key === 'Enter') && !loading) handleSubmit();
	}

	return (!isLoaded ? <>CARREGANDO</> : !isAuthenticated ?
		<Box
			height={'100vh'}
			display={'flex'}
			alignItems={'center'}
			justifyContent={'center'}
			flexDirection={'column'}
			gap={5}
			sx={{ backgroundColor: 'rgb(28, 37, 54)' }}
		>
			<Avatar src={logo} sx={{ height: 160, width: 160 }}></Avatar>
			<Card sx={{ backgroundColor: '#fff' }}>
				<CardContent>
					<Box display={'flex'} flexDirection={'column'} gap={3} width={300}>
						<Typography variant="h5" align="center">
							Login
						</Typography>
						<TextField
							error={!!emailError}
							onChange={e => setEmail(e.target.value)}
							value={email}
							label="Email"
							type="email"
							helperText={emailError}
							onKeyDown={(e) => handleKeyDownEmail(e)}
						/>
						<TextField
							error={!!passwordError}
							onChange={e => setPassword(e.target.value)}
							value={password}
							label="Senha"
							type="password"
							helperText={passwordError}
							onKeyDown={(e) => handleKeyDownPassword(e)}
							inputRef={passwordInputRef}
						/>
					</Box>
				</CardContent>
				<CardActions>
					<Box width={'100%'} display={'flex'} justifyContent={'center'} sx={{ mb: 1 }}>
						<Button variant="contained" onClick={handleSubmit} size="large" disabled={loading} sx={{ minWidth: 100, maxHeight: 45 }}>
							{loading ? <CircularProgress size={35} /> : 'Entrar'}
						</Button>
					</Box>
				</CardActions>
				{networkError && (<Alert severity="error" sx={{ minWidth: 300 }}>Sem Conexão</Alert>)}

			</Card>
		</Box>
		:
		<>{children}</>
	);
};