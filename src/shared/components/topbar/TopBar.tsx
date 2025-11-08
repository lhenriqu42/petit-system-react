import {
	// Badge,
	// Tooltip,
	Avatar,
	IconButton,
	Menu,
	MenuItem,
	Stack,
	Typography,
	useMediaQuery,
	useTheme
} from '@mui/material';

// ICONS
// import SearchIcon from '@mui/icons-material/Search';
// import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
// import NotificationsIcon from '@mui/icons-material/Notifications';


import { useState } from 'react';
import { Box } from '@mui/system';
import { useDrawerContext } from '../../contexts';
import { useAuthContext } from '../../contexts/AuthContext';

export const TopBar: React.FC = () => {
	const { toggleDrawerOpen } = useDrawerContext();
	const theme = useTheme();
	const smDown = useMediaQuery(theme.breakpoints.down('sm'));
	const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);
	const { logout } = useAuthContext();


	const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorElUser(event.currentTarget);
	};
	const handleCloseUserMenu = () => {
		setAnchorElUser(null);
	};
	const handleLogout = () => {
		handleCloseUserMenu();
		logout();

	}


	return (
		<>
			<Box sx={{
				backgroundColor: '#faf9f9',
				position: 'sticky',
				top: 0,
				width: '100%',
				height: theme.spacing(8),
				zIndex: theme.zIndex.appBar,
				overflow: 'visible'
			}}>
				<Stack
					alignItems="center"
					direction="row"
					justifyContent="space-between"
					spacing={2}
					sx={{
						minHeight: theme.spacing(8),
						pr: 3,
						pl: 1,
					}}
				>
					<Stack
						alignItems="center"
						direction="row"
						spacing={2}
					>
						{smDown && (
							<IconButton onClick={toggleDrawerOpen}>
								<MenuIcon fontSize='small' />
							</IconButton>
						)}
					</Stack>
					<Stack
						alignItems="center"
						direction="row"
						spacing={5}
					>

						{/* <Tooltip title="Notificações">
							<IconButton>
								<Badge
									badgeContent={4}
									color="success"
									variant="dot"
								>

									<NotificationsIcon fontSize='small' />

								</Badge>
							</IconButton>
						</Tooltip> */}
						<Avatar
							onClick={handleOpenUserMenu}
							sx={{
								cursor: 'pointer',
								height: theme.spacing(5),
								width: theme.spacing(5)
							}}
						/>
						<Menu
							sx={{
								mt: '48px', "& .MuiMenu-paper":
									{ backgroundColor: "#fff", },
							}}
							id="menu-appbar"
							anchorEl={anchorElUser}
							anchorOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							keepMounted
							transformOrigin={{
								vertical: 'top',
								horizontal: 'right',
							}}
							open={Boolean(anchorElUser)}
							onClose={handleCloseUserMenu}
						>
							<MenuItem onClick={handleLogout}>
								<Typography textAlign="center">Logout</Typography>
							</MenuItem>
						</Menu>
					</Stack>
				</Stack>
			</Box >
		</>
	);
};