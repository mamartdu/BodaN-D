import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { KJUR } from 'jsrsasign';

@Injectable({
  providedIn: 'root'
})
export class GoogleDriveService {

  private serviceAccount = {
    "type": "service_account",
    "project_id": "bodanataliaydiego",
    "private_key_id": "be0bfcd69f771b0eb3e31564e172b911ca41ba28",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCT/iihG5R/lu7v\n9YL7c8lJbBofWDHeYjTmiKeP6EhxtliA5HkGAnlZIV44KvRkf8isBsbTFB9aSTiN\nlsns/JTomOxRw3hVeB7iri87yn6e/ohVokzMJqHQR+5CYSqVMGYKeY5cB83hGQlA\njC+QnCg8saUAdpN/vOZerARZF/dcP+MCA4kDKArB2x4inyqEh7AaSzlCkgTax4B/\nEYDJ5sHrK5AmbrG8l+Cm6O2YT6YRYbKwhGFMT/B1dWOyIIc16L1E4HLn6n7CM7Jg\nUx3OvJtCLURbPlq5RH9XL4/aHk2eC7VXc+PLc/sakVuY8XSDZgg8RbKi1ZJ7oLAQ\n9SFRo8UdAgMBAAECggEAAOEEdf3Npykiwu6sj+mmqW/8u3+9irBYVJ/SEFm7xi8r\nkdcDmJTs4K0BEko27dKTfoH5+20fXgmBFbpimibKaCJezTqWnrb2bUz1SdwZe9gx\n465cwaO+ulA6T94VDvpovTUqGtxcZpgT+RgotQvhIee1vFL0/hSXbgIHeLixDluh\nEke2ReoljXD52f/JHgkrTi9gYXCcCWRIVoy+mxf2lkGVv7TaYW0MBKKgFhI3B5JV\ndDsmV9/kVv3ygL1h7UIwuyJpBTnvd1VbbdFJrzd0jdB0Rj/cRLxFZ7wzsyWGxaNY\n5C2uzlfD0vs2xQCvtxOX7qV9SPhdKsb5OMp050vLbwKBgQDK/QAl19nT/MFop+TA\nfkRc9xOC6HEnxUTdPyOrTX/+2M7Zo27QUzg31rmNbMvp09xhR4DaUeBqtl5f2gLl\nblrP00+Q9K8YRt8XsKiYpuefk3NATkgUnfAy6fSI18kxik6+UwMlvKqj+meMndCb\nEf8wfZj6AmQsTcaCJrSTEEbSUwKBgQC6pGBoOZkQ+rLDtmNLMUZ5Dtb7VquofcnA\n6uVL4FECLBcKeR7rAl8Nxyx6Fo+rAWzArz3Gd5HlBNJ5TyH1PFLPw6NFvooLAGAh\n4OVQFDs2e5UarPdPTBQ4LAa++EmtObinw8UwS2RiCYo3VXteAfdEhJrylUdwVXsb\nNCHIypL8zwKBgQDCpbEKmN1shicAsF6Op4Xuj47KLRK0zFmovu75SSu/uS9BS5Lr\neaGjCeiMUROIeXwOXH6W24STT6VXzLqSPywdtcfKfJeac/thwCkrmIDraH1P4MEF\n5B189RNkVWe8dZ/kqb2O5kfLTkcVdA+hY7SNTyLuOnTMdxgvneXyT91ZuQKBgFlY\nySH7uK+tI5iXHi9ntlHLbdTB58jv9n4YtI2/I2iDzL/hvZBJAVHqL/t+A2acdwBC\no7L3mGrnBQ63eA0axJXbFLUVgqXDl0GAlKXiGXp6bKVpebaHOAKv6MbQuwxm3mPJ\nTwNQhAx+fqEAld8p18IALODF334CHb2nFik1+Gl3AoGBALhP1wTDGZPv+vk0W1A5\nbdu+BUDFonsFO7bEze6qzTan28uju9B9HdUpp7qMyjmko53pdMd9zN5CkrwwP78e\n70zX0RS71FIi6N7qy94YJOSKna9w2Z5cMcQqX+iXepqglM02GQSsQ8R003JOaJYz\nyFuB8AXSqwg27mLh0brPIB5F\n-----END PRIVATE KEY-----\n",
    "client_email": "bodanataliaydiego@bodanataliaydiego.iam.gserviceaccount.com",
    "client_id": "104013589520569639693",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bodanataliaydiego%40bodanataliaydiego.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  }
  ;

  // ID de la carpeta de Google Drive donde se subirán los archivos
  private folderId: string = '1EmJNQHI1kie8K5AINlpaIy6iJHCQE5m3';

  constructor(private http: HttpClient) { }

  /**
   * Genera un JWT firmado con la clave privada de la cuenta de servicio.
   */
  private generateJWT(): string {
    const header = { alg: 'RS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: this.serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/drive.file',
      aud: this.serviceAccount.token_uri,
      exp: now + 3600, // Token válido por 1 hora
      iat: now
    };

    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload);
    // Se firma el JWT usando la clave privada.
    const jwt = KJUR.jws.JWS.sign('RS256', sHeader, sPayload, this.serviceAccount.private_key);
    return jwt;
  }

  /**
   * Solicita un token de acceso a partir del JWT generado.
   */
  private getAccessToken(): Observable<string> {
    const jwt = this.generateJWT();

    // Se construye el cuerpo de la petición en formato x-www-form-urlencoded.
    const body = new URLSearchParams();
    body.set('grant_type', 'urn:ietf:params:oauth:grant-type:jwt-bearer');
    body.set('assertion', jwt);

    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    return this.http.post<any>(this.serviceAccount.token_uri, body.toString(), { headers }).pipe(
      map(response => response.access_token)
    );
  }

  /**
   * Sube el archivo a Google Drive usando el endpoint de subida multipart.
   */
  uploadFile(file: File): Observable<any> {
    // Metadata del archivo a subir, incluyendo el nombre y la carpeta destino
    const metadata = {
      name: file.name,
      parents: [this.folderId]
    };

    // Se crea un FormData y se adjunta la metadata y el archivo.
    const formData: FormData = new FormData();
    formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    formData.append('file', file);

    const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    // Primero se obtiene el token de acceso y luego se realiza la subida.
    return this.getAccessToken().pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post(uploadUrl, formData, { headers });
      })
    );
  }
}
