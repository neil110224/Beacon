/**
 * MERGED FORM DIALOGS - USAGE GUIDE
 * =====================================
 *
 * This guide explains how to use the new merged form dialog components
 * that combine Add and Edit functionality into single reusable components.
 *
 * All dialogs use React Hook Form for validation and form management.
 */

// ============================================
// 1. USER FORM DIALOG (UserFormDialog.jsx)
// ============================================
import UserFormDialog from "./pages/dialog/UserFormDialog";
import {
  useAddUserMutation,
  useUpdateUserMutation,
} from "./features/api/user/userApi";

function UsersPage() {
  // RTK mutations
  const [addUser, { isLoading: addLoading }] = useAddUserMutation();
  const [updateUser, { isLoading: updateLoading }] = useUpdateUserMutation();

  // Dialog state
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Handle add new user
  const handleAddUser = () => {
    setSelectedUser(null); // No user = add mode
    setUserDialogOpen(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setSelectedUser(user); // User data = edit mode
    setUserDialogOpen(true);
  };

  // Handle save (both add and edit)
  const handleSaveUser = (isEdit) => {
    return isEdit ? updateUser(selectedUser.id) : addUser;
  };

  return (
    <>
      <button onClick={handleAddUser}>Add User</button>

      {/* Table with edit buttons */}
      <button onClick={() => handleEditUser(user)}>Edit</button>

      {/* Dialog - Automatically switches between add/edit mode */}
      <UserFormDialog
        open={userDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        user={selectedUser} // null = add mode, object = edit mode
        onSave={handleSaveUser(!!selectedUser)}
        isLoading={addLoading || updateLoading}
      />
    </>
  );
}

// ============================================
// 2. TEAM FORM DIALOG (TeamFormDialog.jsx)
// ============================================
import TeamFormDialog from "./pages/dialog/TeamFormDialog";
import {
  useAddTeamMutation,
  useUpdateTeamMutation,
} from "./features/api/team/teamApi";

function TeamsPage() {
  const [addTeam] = useAddTeamMutation();
  const [updateTeam] = useUpdateTeamMutation();

  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleAddTeam = () => {
    setSelectedTeam(null);
    setTeamDialogOpen(true);
  };

  const handleEditTeam = (team) => {
    setSelectedTeam(team);
    setTeamDialogOpen(true);
  };

  return (
    <>
      <button onClick={handleAddTeam}>Add Team</button>

      <TeamFormDialog
        open={teamDialogOpen}
        onClose={() => setTeamDialogOpen(false)}
        team={selectedTeam} // null = add mode
        onSave={selectedTeam ? updateTeam : addTeam}
        isLoading={false} // Pass your loading state here
      />
    </>
  );
}

// ============================================
// 4. CATEGORY FORM DIALOG (CategoryFormDialog.jsx)
// ============================================
import CategoryFormDialog from "./pages/dialog/CategoryFormDialog";
import {
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from "./features/api/category/categoryApi";

function CategoryPage() {
  const [addCategory] = useAddCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setCategoryDialogOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryDialogOpen(true);
  };

  return (
    <>
      <button onClick={handleAddCategory}>Add Category</button>

      <CategoryFormDialog
        open={categoryDialogOpen}
        onClose={() => setCategoryDialogOpen(false)}
        category={selectedCategory} // null = add mode
        onSave={selectedCategory ? updateCategory : addCategory}
        isLoading={false}
      />
    </>
  );
}

// ============================================
// 5. SYSTEM FORM DIALOG (SystemFormDialog.jsx)
// ============================================
import SystemFormDialog from "./pages/dialog/SystemFormDialog";
import {
  useAddSystemMutation,
  useUpdateSystemMutation,
} from "./features/api/system/systemApi";

function SystemsPage() {
  const [addSystem] = useAddSystemMutation();
  const [updateSystem] = useUpdateSystemMutation();

  const [systemDialogOpen, setSystemDialogOpen] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState(null);

  const handleAddSystem = () => {
    setSelectedSystem(null);
    setSystemDialogOpen(true);
  };

  const handleEditSystem = (system) => {
    setSelectedSystem(system);
    setSystemDialogOpen(true);
  };

  const handleSystemSaved = () => {
    // Refetch systems if needed
    console.log("System saved successfully");
  };

  return (
    <>
      <button onClick={handleAddSystem}>Add System</button>

      <SystemFormDialog
        open={systemDialogOpen}
        onClose={() => setSystemDialogOpen(false)}
        system={selectedSystem} // null = add mode
        onSave={selectedSystem ? updateSystem : addSystem}
        isLoading={false}
        onSuccess={handleSystemSaved} // Called after successful add
      />
    </>
  );
}

// ============================================
// KEY DESIGN PATTERNS
// ============================================

/**
 * MODE DETECTION:
 * - If the "data" prop (user, team, charging, etc) is null → ADD MODE
 * - If the "data" prop is an object → EDIT MODE
 *
 * MUTATION HANDLING:
 * - onSave prop should be the mutation function
 * - The component calls: await onSave(payload).unwrap();
 * - For add mode: mutation receives full form data
 * - For edit mode: mutation receives form data + id
 *
 * VALIDATION:
 * - All dialogs use React Hook Form with Yup validation
 * - Validation errors displayed below fields
 * - Form won't submit if validation fails
 *
 * PASSWORD FIELD:
 * - UserFormDialog only shows password field in ADD mode
 * - Password field is hidden in EDIT mode (users can't change via this dialog)
 *
 * API WRAPPERS:
 * - User Dialog: standard object payload
 * - Team Dialog: wraps data in { teams: [...] } for add mode only
 * - Charging Dialog: wraps data in { departments: [...] } for add mode only
 * - Category Dialog: standard object payload
 * - System Dialog: standard object payload
 */

// ============================================
// INSTALLATION REQUIREMENTS
// ============================================
// npm install react-hook-form yup @hookform/resolvers
