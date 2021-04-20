import Link from 'next/link';

const Header = ({ currentUser }) => {
  const authLinks = [
    !currentUser && { label: 'Sign Up', href: '/auth/signup' },
    !currentUser && { label: 'Sign In', href: '/auth/signin' },
    currentUser && { label: 'Sign Out', href: '/auth/signout' }
  ]
    .filter(link => link)
    .map(({ label, href }) => {
      return (
        <li>
          <Link href={href} className="nav-item">
            <a className="nav-link">{label}</a>
          </Link>
        </li>
      );
    });

  return (
    <nav className="navbar navbar-light bg-light">
      <Link href="/">
        <a className="navbar-brand">GetTix</a>
      </Link>

      <div className="d-flex justify-content-end">
        <ul className="nav d-flex align-items-center">
          {authLinks}
        </ul>
      </div>
    </nav>
  );
};

export default Header;
