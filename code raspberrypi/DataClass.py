class DataClass:
    """
    A class for handling data conversion and casting.

    Attributes:
        KEYS (list): A list of keys representing the attributes of the class.
    """

    KEYS: list = ...

    @classmethod
    def from_raw(cls, data):
        """
        Convert raw data into an instance of the class.

        Args:
            data: The raw data to be converted.

        Returns:
            An instance of the class with attributes set according to the raw data.
        """
        out = cls()
        for k, v in zip(out.KEYS, data):
            setattr(out, k, v)

        return out

    @classmethod
    def from_raw_list(cls, data):
        """
        Convert a list of raw data into a list of instances of the class.

        Args:
            data: The list of raw data to be converted.

        Returns:
            A list of instances of the class with attributes set according to the raw data.
        """
        out = []
        if data is not None:
            for row in data:
                out.append(cls.from_raw(row))
        return out

    @classmethod
    def cast(cls, func):
        """
        Decorator to cast the output of a function into a list of instances of the class.

        Args:
            func: The function to be decorated.

        Returns:
            The decorated function that returns a list of instances of the class.
        """
        def wrapper(*args, **kwargs):
            out = func(*args, **kwargs)
            return cls.from_raw_list(out)
        return wrapper

    @classmethod
    def cast_single(cls, func):
        """
        Decorator to cast the output of a function into an instance of the class.

        Args:
            func: The function to be decorated.

        Returns:
            The decorated function that returns an instance of the class.
        """
        def wrapper(*args, **kwargs):
            out = func(*args, **kwargs)
            return cls.from_raw(out)
        return wrapper

    def __repr__(self):
        """
        Return a string representation of the class instance.

        Returns:
            A string representation of the class instance.
        """
        return '{' + ', '.join(map(lambda k: f'{k}: {getattr(self, k, None)}', self.KEYS)) + '}'

class Mesures(DataClass):
	KEYS = [
		'idCapteur',
		'dateCreation',
        'valeur'
	]

class Capteur(DataClass):
	KEYS = [
		'idCapteur',
		'date_installation',
		'date_desinstallation',
		'nom',
		'type'
	]

class Utilisateur(DataClass):
	KEYS = [
		'idUtilisateur',
		'username',
		'password'
	]