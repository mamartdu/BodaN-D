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
    "private_key_id": "23058c3f83cfb5950d0d147299da40bfb96413d2",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDIjKpAcczSMIiA\nIugmfGJ7yTAhn89I966GxzWLofyy5Uay3DZvGyVSNKeAWAK3stUEpUYGa7Xkpbcn\nqujubreopYHaaWGsaHoRwlYtGH84L02Zk1NGy9E37DMmJaDRXEcYqQLcT7/n1Il/\nriTOpQ20AgnntD78LJs97Jsdtolx7iI/UpAmCXJu4YOeBm7VclqXRbaeEujHS+ir\nEs4co4T9Ljdu9FgwP2oHA0w6p0nTaKcp7LVDefXpUglM0YaeDi2Av6tjsZvje+S0\nkcsoT3Pg0zmRo2QXt95CqPC0WGxA7oJScCXo6sg1NmFWSSBglTo4P7ZWHEufik4D\n0ePF6LCrAgMBAAECggEABYZmjFb2QxYmNI2BosnLdsiQpGSAM+zq6Hilf37LdOw/\nGd9aOo5fZVfhA3apQIFTQAkDmFqwTKfKF3QsbaEsOx+wJ6G+mJ7aOhIGCMEDhDs9\nYo09/pXP4kAGGrdvqkTmCoZhd0tVKKBg110nU3AVpA9oUXNURuM9taOGlHd6auKN\nlmXb0fNZ1w1T6pB8qWL4qAsG4ijdaxE//FkVxOTkyc5eCKmPfKSjmauekfG4Uist\nZt6Du1EQjqAA9+RHVuLkxjoidBq9bb5bB9qPu3FO8VQltp761CMjZkZ2VRPts3aK\nWFZgj7xdncqRLFKutJWVG1krUqSJKLhWHhf0zr3MbQKBgQD0vk5B9y2m4aikImVX\nwUxn4X8Eaj3NeOox7//+Vskruzxwk57mMNOKpeRFUXyBSwSQibwBRM54Q+zRx6D9\n0RaiXCOKa5A/JHw7s2QUZ8CCQmgK7WJsR3HD7rFwHfpk50OXNKW2nI4gdmXQg5PI\n7iFFQVGrVdBECZRhqp0xrphKFwKBgQDRxgE53QWnDgN+cZNyRFZvDpS51ScxAm4K\nuhIoLmYyl331N7IndXFeKm4umkqTzZWQD7gY5s6sID80RiEeFMACp2xR/o3lpUto\nUbOfEqYANCKUjMKkJDe0v5qvp9dcTBeyoXswZhth5Fze9uKReMrq1iMwh/AtsNSO\nEZeJXp5ujQKBgH+OlCEDX/LDV+670o/rOhRGTboSWUW3CHCggo6f0teNDZIrDj0x\nI3/2uEN8leSZIbbnYmpS3z2FQW+QmRLQn/hdB1UEfLi8HlfLRpTwAkChtbJESPDg\nR6XzyN0DctaWRf8PvHKxo829h5Emkqa9ne+HfLZM0nAzgfdpQeZ79flfAoGAaIrq\nT4ED8SY9vYUyu06tWLmGizpcRsN0PepPZDEDg5EWF+BC7AFOl2RD9vuz0Qcy01HS\nKK7WLtf/R7jvhkNHEcuIYzCeXOVMuFeHUe6ERjO1TBz+X7kg/fZDS+k0ne3aHY72\nir9IRDf/xKp7bY4qanB/pw8INm0a8RZ5U9+Qy30CgYA47BkyTpVs2+W23sgkwNom\nDj99mcNvPTyz6gSRIh44zR/QupHV/pdmDK1HjU205n0wbCdYxbK24QZPcl2drw/N\nCodmVn9UDOCYnl/PD+nyK9Xv1Qv9+0UiI1TBTLhbS60es8g7pvtBmGkA97ucD8dw\n145XFFPvIH6ZpaknVlE1og==\n-----END PRIVATE KEY-----\n",
    "client_email": "bodanataliaydiego@bodanataliaydiego.iam.gserviceaccount.com",
    "client_id": "109176381362620820273",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/bodanataliaydiego%40bodanataliaydiego.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

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
