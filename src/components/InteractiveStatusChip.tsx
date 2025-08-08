import React, { useState } from 'react';
import {
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';
import { ReactElement } from 'react';

export interface StatusOption {
  value: string;
  label: string;
  icon: ReactElement;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

interface InteractiveStatusChipProps {
  status: string;
  statusIcon: ReactElement;
  statusColor: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  statusOptions: StatusOption[];
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  tooltipText?: string;
}

const InteractiveStatusChip: React.FC<InteractiveStatusChipProps> = ({
  status,
  statusIcon,
  statusColor,
  statusOptions,
  onStatusChange,
  disabled = false,
  size = 'small',
  tooltipText = 'Click to update status',
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (!disabled) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = (newStatus: string) => {
    onStatusChange(newStatus);
    handleClose();
  };

  const isOpen = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={disabled ? 'Status cannot be changed' : tooltipText}>
        <Chip
          icon={statusIcon}
          label={status}
          color={statusColor}
          size={size}
          onClick={handleClick}
          sx={{
            cursor: disabled ? 'default' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            '&:hover': disabled ? {} : {
              opacity: 0.8,
              transform: 'scale(1.05)',
              transition: 'all 0.2s ease-in-out'
            }
          }}
        />
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={isOpen}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {statusOptions.map((option) => (
          <MenuItem 
            key={option.value} 
            onClick={() => handleStatusUpdate(option.value)}
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: 1,
              minWidth: 120
            }}
          >
            {option.icon}
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default InteractiveStatusChip;
