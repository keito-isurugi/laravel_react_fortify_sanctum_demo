import axios, { AxiosResponse } from "axios";
import React, {useContext, createContext, useState, ReactNode, useEffect} from "react"
import {Route, Redirect, useHistory} from "react-router-dom"

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  two_factor_recovery_codes: string | null
  two_factor_secret: string | null
  created_at: string
  updated_at: string | null
}
interface LoginData {
  email: string,
  password: string,
}
interface RegisterData {
  email: string,
  password: string,
  password_confirmation: string,
}
interface ProfileData {
  name?: string,
  email?: string
}
interface authProps {
  user: User | null;
  register: (registerData: RegisterData) => Promise<void>
  signin: (loginData: LoginData) => Promise<void>;
  signout: () => Promise<void>;
  saveProfile: (formData: FormData | ProfileData) => Promise<void>;
}
interface Props {
  children: ReactNode
}
interface RouteProps {
  children: ReactNode,
  path: string,
  exact?: boolean
}
interface From {
  from: Location
}

const authContext = createContext<authProps | null>(null)

const ProvideAuth = ({children}: Props) => {
  const auth = useProvideAuth();
  return (
    <authContext.Provider value={auth}>
      {children}
    </authContext.Provider>
  )
}
export default ProvideAuth

export const useAuth = () => {
  return useContext(authContext)
}

const useProvideAuth = () => {
  const [user, setUser] = useState<User | null>(null);

  const register = async (registerData: RegisterData) => {
    console.log('regisetr!')
    console.log(registerData)
    return await axios.post('/api/register', registerData).then((res) => {
      console.log('api-register')
      console.log(res)
      axios.get('api/user').then((res) => {
        console.log('api-user')
        console.log(res.data)
        setUser(res.data)
      }).catch((error) => {
        console.log(error)
      })
    })
  }

  const signin = async (loginData: LoginData) => {
    console.log(loginData)
    try {
      const res = await axios.post('/api/login', loginData);
      console.log('signin-try')
      console.log(res)
    } catch (error) {
      console.log('signin-error')
      console.log(error)
      throw error;
    }

    return axios.get('/api/user').then((res) => {
      console.log('login')
      console.log(res.data)
      setUser(res.data)
    }).catch((error) => {
      console.log('login-error')
      console.log(error)
      setUser(null)
    })
  }

  const signout = () => {
    return axios.post('/api/logout', {}).then(() => {
      setUser(null)
    })
  }

  const saveProfile = async (formData: FormData | ProfileData) => {
    console.log(formData)
    const res = await axios.post(
      '/api/user/profile-information', 
      formData, 
      {headers: {'X-HTTP-Method-Override': 'PUT'}}
      )
      .catch((error) => {
      console.log(error)
      throw error;
    })
    if(res?.status == 200) {
      return axios.get('/api/user').then((res) => {
        setUser(res.data)
        console.log(res.data)
      }).catch((error) => {
        console.log(error)
        setUser(null)
      })
    }
  }

  useEffect(() => {
    axios.get('/api/user').then((res) => {
      setUser(res.data)
    }).catch((error) => {
      setUser(null)
    })
  }, [])

  return {
    user,
    register,
    signin,
    signout,
    saveProfile
  }
}

/**
 * ????????????????????????????????????
 */
export const PrivateRoute = ({children, path, exact = false}: RouteProps) => {
  const auth = useAuth()
  return (
    <Route
      path={path}
      exact={exact}
      render={({ location }) => {
        if(auth?.user == null) {
          return <Redirect to={{ pathname: "/login", state: { from: location }}}/>
        } else {
          return children
        }
      }}
    />
  )
}


/**
 * ?????????????????????????????????????????????????????????????????????????????????
 */
export const PublicRoute = ({children, path, exact = false}: RouteProps) => {
  const auth = useAuth()
  const history = useHistory()
  return (
    <Route
      path={path}
      exact={exact}
      render={({ location }) => {
        if(auth?.user == null) {
          return children
        } else {
          return <Redirect to={{pathname: (history.location.state as From) ? (history.location.state as From).from.pathname : '/' , state: { from: location }}}/>
        }
      }}
    />
  )
}