import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
  Collapse,
  IconButton,
} from '@mui/material';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const OSWALD = '"Oswald", sans-serif';

const CHECKBOX_SX = {
  color: '#9e9e9e',
  '&.Mui-checked': { color: '#2c3e50' },
  '&.MuiCheckbox-indeterminate': { color: '#2c3e50' },
};

const PARENT_LABEL_SX = {
  '& .MuiFormControlLabel-label': {
    fontSize: '0.95rem',
    fontWeight: 600,
    fontFamily: OSWALD,
    color: '#2c3e50',
  },
};

const CHILD_LABEL_SX = {
  '& .MuiFormControlLabel-label': {
    fontSize: '0.875rem',
    fontFamily: OSWALD,
    color: '#444',
  },
};

// ─── Permission definitions ───────────────────────────────────────────────────

const DASHBOARD_SUBCHILDREN = ['Dashboard.FilterTeam'];
const SYSTEMS_SUBCHILDREN = ['Systems.Add', 'Systems.Import'];
const MASTERLIST_CHILDREN = ['Users', 'Category', 'Team', 'Charging', 'Role'];

const ALL_DASHBOARD_PERMS = ['Dashboard', ...DASHBOARD_SUBCHILDREN];
const ALL_SYSTEMS_PERMS = ['Systems', ...SYSTEMS_SUBCHILDREN];
const ALL_MASTERLIST_PERMS = ['Masterlist', ...MASTERLIST_CHILDREN];

// ─── Validation ───────────────────────────────────────────────────────────────

const validationSchema = yup.object().shape({
  name: yup.string().required('Role name is required').min(2, 'Role name must be at least 2 characters'),
  permissions: yup.array().min(1, 'At least one permission must be selected'),
});

// ─── Small helpers ────────────────────────────────────────────────────────────

const allIn = (perms, selected) => perms.every((p) => selected.includes(p));
const someIn = (perms, selected) => perms.some((p) => selected.includes(p));
const toggle = (perm, selected) =>
  selected.includes(perm) ? selected.filter((p) => p !== perm) : [...selected, perm];
const addAll = (perms, selected) => Array.from(new Set([...selected, ...perms]));
const removeAll = (perms, selected) => selected.filter((p) => !perms.includes(p));

// ─── Collapsible Section Wrapper ──────────────────────────────────────────────

function CollapsibleSection({ title, isOpen, onToggle, isChecked, isIndeterminate, onParentChange, children }) {
  return (
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#fafafa',
        overflow: 'hidden',
      }}
    >
      {/* Header row */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px 8px 4px',
        }}
      >
        <FormControlLabel
          label={title}
          sx={{ ...PARENT_LABEL_SX, mb: 0, mr: 0, flexGrow: 1 }}
          onClick={(e) => e.stopPropagation()}
          control={
            <Checkbox
              checked={isChecked}
              indeterminate={isIndeterminate}
              onChange={onParentChange}
              sx={CHECKBOX_SX}
            />
          }
        />
        <IconButton
          size="small"
          onClick={onToggle}
          sx={{
            width: 28,
            height: 28,
            backgroundColor: '#2c3e50',
            color: '#fff',
            borderRadius: '4px',
            flexShrink: 0,
            '&:hover': { backgroundColor: '#34495e' },
          }}
        >
          {isOpen
            ? <KeyboardArrowUpIcon sx={{ fontSize: '1.1rem' }} />
            : <KeyboardArrowDownIcon sx={{ fontSize: '1.1rem' }} />
          }
        </IconButton>
      </Box>

      {/* Collapsible content */}
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <Divider sx={{ borderColor: '#e0e0e0' }} />
        <Box sx={{ padding: '10px 16px 12px 16px' }}>
          {children}
        </Box>
      </Collapse>
    </Box>
  );
}

// ─── Section: Dashboard ───────────────────────────────────────────────────────

function DashboardSection({ selected, onChange }) {
  const [open, setOpen] = useState(true);
  const allPerms = ALL_DASHBOARD_PERMS;
  const checkedAll = allIn(allPerms, selected);
  const indeterminate = !checkedAll && someIn(allPerms, selected);

  return (
    <CollapsibleSection
      title="Dashboard"
      isOpen={open}
      onToggle={() => setOpen((v) => !v)}
      isChecked={checkedAll}
      isIndeterminate={indeterminate}
      onParentChange={() => onChange(checkedAll ? removeAll(allPerms, selected) : addAll(allPerms, selected))}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
        {DASHBOARD_SUBCHILDREN.map((sub) => (
          <FormControlLabel
            key={sub}
            label={sub}
            sx={CHILD_LABEL_SX}
            control={
              <Checkbox
                checked={selected.includes(sub)}
                onChange={() => onChange(toggle(sub, selected))}
                sx={CHECKBOX_SX}
              />
            }
          />
        ))}
      </Box>
    </CollapsibleSection>
  );
}

// ─── Section: Systems ─────────────────────────────────────────────────────────

function SystemsSection({ selected, onChange }) {
  const [open, setOpen] = useState(true);
  const allPerms = ALL_SYSTEMS_PERMS;
  const checkedAll = allIn(allPerms, selected);
  const indeterminate = !checkedAll && someIn(allPerms, selected);

  return (
    <CollapsibleSection
      title="Systems"
      isOpen={open}
      onToggle={() => setOpen((v) => !v)}
      isChecked={checkedAll}
      isIndeterminate={indeterminate}
      onParentChange={() => onChange(checkedAll ? removeAll(allPerms, selected) : addAll(allPerms, selected))}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
        {SYSTEMS_SUBCHILDREN.map((sub) => (
          <FormControlLabel
            key={sub}
            label={sub}
            sx={CHILD_LABEL_SX}
            control={
              <Checkbox
                checked={selected.includes(sub)}
                onChange={() => onChange(toggle(sub, selected))}
                sx={CHECKBOX_SX}
              />
            }
          />
        ))}
      </Box>
    </CollapsibleSection>
  );
}

// ─── Section: Masterlist ──────────────────────────────────────────────────────

function MasterlistSection({ selected, onChange }) {
  const [open, setOpen] = useState(true);
  const allPerms = ALL_MASTERLIST_PERMS;
  const checkedAll = allIn(allPerms, selected);
  const indeterminate = !checkedAll && someIn(allPerms, selected);

  return (
    <CollapsibleSection
      title="Masterlist"
      isOpen={open}
      onToggle={() => setOpen((v) => !v)}
      isChecked={checkedAll}
      isIndeterminate={indeterminate}
      onParentChange={() => onChange(checkedAll ? removeAll(allPerms, selected) : addAll(allPerms, selected))}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2 }}>
        {MASTERLIST_CHILDREN.map((child, idx) => (
          <Box key={child}>
            {idx > 0 && <Divider sx={{ my: 0.5, borderColor: '#eee' }} />}
            <FormControlLabel
              label={child}
              sx={CHILD_LABEL_SX}
              control={
                <Checkbox
                  checked={selected.includes(child)}
                  onChange={() => onChange(toggle(child, selected))}
                  sx={CHECKBOX_SX}
                />
              }
            />
          </Box>
        ))}
      </Box>
    </CollapsibleSection>
  );
}

// ─── Main Dialog ──────────────────────────────────────────────────────────────

export default function RoleFormDialog({ open, onClose, role = null, onSave, isLoading = false, onSuccess, onError }) {
  const isEdit = !!role;
  const [localLoading, setLocalLoading] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const isSubmittingRef = useRef(false); // immediate lock — prevents duplicate submissions before state re-renders

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: { name: '', permissions: [] },
  });

  const selectedPermissions = watch('permissions') || [];
  const handlePermChange = (newPerms) => setValue('permissions', newPerms);

  // Reset all state only when the dialog opens — never on close.
  // This ensures justSaved keeps the button disabled until the dialog fully closes
  // and reopens fresh for the next operation.
  useEffect(() => {
    if (open) {
      isSubmittingRef.current = false;
      setJustSaved(false);
      setLocalLoading(false);
      reset(
        isEdit && role
          ? { name: role.name || '', permissions: role.access_permissions || [] }
          : { name: '', permissions: [] }
      );
    }
  }, [open, role, isEdit, reset]);

  const onSubmit = async (data) => {
    if (isSubmittingRef.current) return; // block any subsequent clicks
    isSubmittingRef.current = true;
    setLocalLoading(true);
    try {
      if (isEdit) {
        await onSave({ id: role.id, data: { name: data.name, access_permissions: data.permissions } }).unwrap();
      } else {
        await onSave({ name: data.name, access_permissions: data.permissions }).unwrap();
      }
      setJustSaved(true);
      setLocalLoading(false);
      onSuccess?.(isEdit ? 'Role updated successfully!' : 'Role created successfully!');
      setTimeout(() => { onClose(); }, 1000);
    } catch (error) {
      isSubmittingRef.current = false; // release lock so user can retry
      setLocalLoading(false);
      onError?.(error?.data?.message || error.message || 'An error occurred');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' } }}
    >
      <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', color: '#2c3e50', fontFamily: OSWALD }}>
        {isEdit ? 'Edit Role' : 'Add New Role'}
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>

          {/* Role Name */}
          <TextField
            label="Role Name"
            fullWidth
            placeholder="Enter role name"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register('name')}
            sx={{
              '& input, & label': { fontFamily: OSWALD },
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '&:hover fieldset': { borderColor: '#2c3e50' },
                '&.Mui-focused fieldset': { borderColor: '#2c3e50' },
              },
            }}
          />

          {/* Permissions */}
          <Box>
            <Typography sx={{ fontWeight: 600, mb: 1.5, color: '#2c3e50', fontFamily: OSWALD }}>
              Permissions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <DashboardSection selected={selectedPermissions} onChange={handlePermChange} />
              <SystemsSection selected={selectedPermissions} onChange={handlePermChange} />
              <MasterlistSection selected={selectedPermissions} onChange={handlePermChange} />
            </Box>

            {errors.permissions && (
              <Typography sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 1, fontFamily: OSWALD }}>
                {errors.permissions.message}
              </Typography>
            )}
          </Box>

        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: 2, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={isLoading || localLoading || justSaved}
          sx={{ textTransform: 'none', color: '#5a6ac4', fontFamily: OSWALD, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isLoading || localLoading || justSaved || selectedPermissions.length === 0}
          startIcon={(isLoading || localLoading || justSaved) && <CircularProgress size={20} />}
          sx={{
            textTransform: 'none',
            backgroundColor: '#03346E',
            fontFamily: OSWALD,
            '&:hover': { backgroundColor: '#022d61' },
            '&:disabled': { backgroundColor: '#ccc' },
          }}
        >
          {localLoading ? 'Saving...' : justSaved ? 'Saved!' : isEdit ? 'Update Role' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}