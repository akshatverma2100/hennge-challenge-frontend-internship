import type { CSSProperties, Dispatch, SetStateAction } from 'react';
import {useState} from 'react'

interface CreateUserFormProps {
  setUserWasCreated: Dispatch<SetStateAction<boolean>>;
}

//this would be easy if we use zod library (but it is prohibited).

const PASSWORD_RULES = [
  { id: 'minLength', message: 'Password must be at least 10 characters long', test: (p: string) => p.length >= 10 },
  { id: 'maxLength', message: 'Password must be at most 24 characters long', test: (p: string) => p.length <= 24 },
  { id: 'noSpaces', message: 'Password cannot contain spaces', test: (p: string) => !/\s/.test(p) },
  { id: 'hasNumber', message: 'Password must contain at least one number', test: (p: string) => /\d/.test(p) },
  { id: 'hasUpper', message: 'Password must contain at least one uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'hasLower', message: 'Password must contain at least one lowercase letter', test: (p: string) => /[a-z]/.test(p) },
];

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOlsiYWtzaGF0dmVybWEyMTAwQGdtYWlsLmNvbSJdLCJpc3MiOiJoZW5uZ2UtYWRtaXNzaW9uLWNoYWxsZW5nZSIsInN1YiI6ImNoYWxsZW5nZSJ9.Do-1qhF2BwQ9HUYCfS4zDBmlo89LVw9PPjUNBgnLd_0'; 

function CreateUserForm({setUserWasCreated}: CreateUserFormProps) {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
   const [apiError, setApiError] = useState<string | null>(null);

  const isPasswordValid = PASSWORD_RULES.every(rule => rule.test(password));

   const failedRules = password.length > 0
    ? PASSWORD_RULES.filter(rule => !rule.test(password))
    : [];

  const ApiCall = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // stops the the page from refreshingG;
    setApiError(null) // reset previous api calls;

    if (!username || !isPasswordValid) return; 
    
    try{
      const response = await fetch(
        'https://api.challenge.hennge.com/password-validation-challenge-api/001/challenge-signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TOKEN}`,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (response.ok) {
        setUserWasCreated(true);
        return;
      }
 
      if (response.status === 401 || response.status === 403) {
        setApiError('Not authenticated to access this resource.');
        return;
      }
 
      if (response.status === 500) {
        setApiError('Something went wrong, please try again.');
        return;
      }
 
      if (response.status === 400 || response.status === 422) {
        const data = await response.json();
        if (data.errors?.includes('not_allowed')) {
          setApiError('Sorry, the entered password is not allowed, please try a different one.');
          return;
        }
        setApiError('Something went wrong, please try again.');
        return;
      }
 
      setApiError('Something went wrong, please try again.');

    }catch(e){
        setApiError('Something went wrong, please try again.');
    }


  }

  return (
    <div style={formWrapper}>
      <form style={form}>
        {/* make sure the username and password are submitted */}
        {/* make sure the inputs have the accessible names of their labels */}
        <label htmlFor="username"  style={formLabel}>Username</label>
        <input
          id="username"
          onChange={(e : any)=>{setUsername(e.target.value)}}
          style={formInput} />

        <label htmlFor="password"  style={formLabel}>Password</label>
        <input 
          id="password"
          onChange={(e : any)=>{setPassword(e.target.value)}}
          style={{
            ...formInput,
            // CREATES A RED BORDER IF PASsWORD CRITERIA DOESN'T MATCH..
            ...(!isPasswordValid && password.length > 0 ? { borderColor: 'red' } : {}),
          }} />

          {failedRules.length > 0 && (
          <ul style={validationList}>
            {failedRules.map(rule => (
              <li key={rule.id} style={validationItem}>{rule.message}</li>
            ))}
          </ul>
        )}
 
        {apiError && (
          <p style={apiErrorStyle}>{apiError}</p>
        )}

        <button onClick={ApiCall}  style={formButton}>Create User</button>
      </form>
    </div>
  );
}

export { CreateUserForm };

const formWrapper: CSSProperties = {
  maxWidth: '500px',
  width: '80%',
  backgroundColor: '#efeef5',
  padding: '24px',
  borderRadius: '8px',
};

const form: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const formLabel: CSSProperties = {
  fontWeight: 700,
};

const formInput: CSSProperties = {
  outline: 'none',
  padding: '8px 16px',
  height: '40px',
  fontSize: '14px',
  backgroundColor: '#f8f7fa',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  borderRadius: '4px',
};

const formButton: CSSProperties = {
  outline: 'none',
  borderRadius: '4px',
  border: '1px solid rgba(0, 0, 0, 0.12)',
  backgroundColor: '#7135d2',
  color: 'white',
  fontSize: '16px',
  fontWeight: 500,
  height: '40px',
  padding: '0 8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: '8px',
  alignSelf: 'flex-end',
  cursor: 'pointer',
};

//added css styles

const validationList: CSSProperties = {
  margin: '4px 0 0 0',
  paddingLeft: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
};

const validationItem: CSSProperties = {
  fontSize: '13px',
  color: '#c0392b',
};
 
const apiErrorStyle: CSSProperties = {
  fontSize: '13px',
  color: '#c0392b',
  margin: '4px 0 0 0',
  padding: '8px 12px',
  backgroundColor: '#fdecea',
  borderRadius: '4px',
  border: '1px solid #f5c6cb',
};