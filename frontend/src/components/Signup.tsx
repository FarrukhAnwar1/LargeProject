function Signup(){
    return (
        <div className="card" id="loginDiv">
            <div className='text-center'>
                <strong className='text-2xl font-bold'>Sign Up</strong>
            </div>
            <div className="flex">
                <div className="login-input mr-auto pt-4">
                    <p className=''>Email:</p>
                    <input
                        className='p-2'
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Email"
                        />
                </div>
                <div className="login-input ml-auto pt-4">
                    <p className=''>Email:</p>
                    <input
                        className='p-2'
                        type="text"
                        id="email"
                        name="email"
                        placeholder="Email"
                        />
                </div>
            </div>
            <br />
            <div className="login-input !pb-0">
            Password:
            <br />
            <input
                className="p-2"
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Password"
                />
            </div>
            
            <div className='text-right'>
                <a href='' className='font-medium text-[var(--primary)] hover:underline'>Forgot Password?</a>
            </div>

            <div className='pt-10'>
                <button
                    className='w-full bg-linear-65 from-[var(--primary)] to-[var(--muted)]'
                    type="submit"
                    id="loginButton"
                    value="Do It"
                >Login</button>
            </div>
            <br/>
            <div className='text-center'>
                <span id="loginResult" className='font-medium'></span>
            </div>
            <div className='pt-4'>
            </div>
        </div>
    );
}

export default Signup;